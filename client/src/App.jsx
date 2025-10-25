import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { useAppContext } from "./context/AppContext";
import ProtectedRoute from "./routes/PrivateRoute";

const App = () => {
  const { showLogin } = useAppContext();

  return (
    <>
      <Navbar />
      {showLogin && <AuthModal />}

      <Routes>
        <Route path="/" element={<Home />} />

        {/*  Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
};

export default App;
