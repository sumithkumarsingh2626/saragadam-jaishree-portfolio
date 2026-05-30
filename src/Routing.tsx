import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";

const Contact = lazy(() => import("./components/contact/Contact"));

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/contact"
          element={
            <Suspense fallback={null}>
              <Contact />
            </Suspense>
          }
        />
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  );
};

export default Routing;
