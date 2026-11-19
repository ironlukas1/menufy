import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchGoogleRating,createRequestBudget} from '../src/server/google/places.ts';
const id='ChIJtestRestaurant123';
const place={id,displayName:{text:'Test Bistro'},rating:4.6,userRatingCount:123,googleMapsUri:'https://maps.google.com/?cid=123'};
test('fetches fresh rating/count from Google using server headers and a narrow field mask',async()=>{
 let request;
 const result=await fetchGoogleRating(id,'test-secret',async(url,options)=>{request={url,options};return Response.json(place);});
 assert.equal(result.rating,4.6);assert.equal(result.ratingCount,123);
 assert.ok(!request.url.includes('test-secret'));assert.equal(request.options.headers['X-Goog-Api-Key'],'test-secret');
 assert.equal(request.options.cache,'no-store');assert.ok(!request.options.headers['X-Goog-FieldMask'].split(',').includes('reviews'));
 assert.ok(!JSON.stringify(result).includes('test-secret'));
});
test('unrated places have no invented average',async()=>{
 const result=await fetchGoogleRating(id,'key',async()=>Response.json({id,displayName:{text:'New Bistro'}}));
 assert.equal(result.rating,null);assert.equal(result.ratingCount,0);
});
test('rejects invalid IDs before making any provider request',async()=>{
 let called=false;
 await assert.rejects(fetchGoogleRating('../invalid','key',async()=>{called=true;return Response.json(place);}),{code:'PLACE_NOT_FOUND'});
 assert.equal(called,false);
});
test('provider failures expose no secret or upstream error body',async()=>{
 await assert.rejects(fetchGoogleRating(id,'secret',async()=>new Response('secret provider details',{status:403})),{message:'GOOGLE_UNAVAILABLE'});
 await assert.rejects(fetchGoogleRating(id,'secret',async()=>{throw Error('secret');}),{message:'GOOGLE_UNAVAILABLE'});
 await assert.rejects(fetchGoogleRating(id,'secret',async()=>new Response('',{status:404})),{code:'PLACE_NOT_FOUND'});
});
test('rejects mismatched places and malformed rating data',async()=>{
 for(const data of [{...place,id:'another-place'},{...place,rating:6},{...place,rating:null},{...place,userRatingCount:-1},{...place,userRatingCount:'123'}])
  await assert.rejects(fetchGoogleRating(id,'key',async()=>Response.json(data)),{code:'INVALID_RESPONSE'});
});
test('provider links are safe and Google attribution remains separate',async()=>{
 const result=await fetchGoogleRating(id,'key',async()=>Response.json({...place,googleMapsUri:'https://evil.invalid',attributions:[{provider:'Data provider',providerUri:'javascript:alert(1)'},{provider:'Other provider',providerUri:'https://example.com'}]}));
 assert.equal(new URL(result.mapsUrl).hostname,'www.google.com');assert.equal(result.attributions[0].url,null);assert.equal(result.attributions[1].url,'https://example.com/');
});
test('request budget blocks excess calls and recovers after the time window',()=>{
 const take=createRequestBudget(2,60000);
 assert.equal(take(100000),true);assert.equal(take(100001),true);assert.equal(take(100002),false);assert.equal(take(160000),true);
});
