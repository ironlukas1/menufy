import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "@/components/Layout";
import { ProtoProvider, RequireAuth } from "@/proto/ProtoContext";
import Browse from "@/pages/Browse";
import Feed from "@/pages/Feed";
import Detail from "@/pages/Detail";
import Saved from "@/pages/Saved";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import { ForgotPassword, Login, ResetPassword } from "@/pages/Auth";

export default function App() {
  return (
    <ProtoProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<Browse />}>
              <Route index element={<Feed />} />
              <Route path="restaurant/:slug" element={<Detail />} />
            </Route>
            <Route path="saved" element={<RequireAuth><Saved /></RequireAuth>} />
            <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="settings" element={<Settings />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProtoProvider>
  );
}
