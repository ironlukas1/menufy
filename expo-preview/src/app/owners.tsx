import { WebScreen } from '../components/WebScreen';

/** Secondary fallback: the owner portal is still web-based while its native rewrite is pending. */
export default function OwnersScreen() {
  return <WebScreen path="/owners" />;
}
