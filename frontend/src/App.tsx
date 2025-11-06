// src/App.tsx
import SignIn from "./LoginScreen.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignUp from "./SignUpScreen.tsx";
import Dashboard from "./Dashboard.tsx";
import {Toaster} from "sonner";
import EventList from "./EventListScreen.tsx";
import DashboardLayout from "./DashboardLayout.tsx";
import EventDetail from "./EvenDetails.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "",
          style: {
            background: "#fff",
            color: "#1f2937", // text-gray-800
            borderRadius: "0.5rem", // rounded-lg
            padding: "12px 16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboardLayout" element={<DashboardLayout />}/>


        <Route element={<DashboardLayout/>}>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/events" element={<EventList />}/>
          <Route path="/eventDetails" element={<EventDetail />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
