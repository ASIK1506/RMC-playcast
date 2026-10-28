import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Display from "./pages/Display";
import Projector from "./pages/Projector";
import Stage from "./pages/Stage";
import Remote from "./pages/Remote";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/display" element={<Display />} />
        <Route path="/projector" element={<Projector />} />
        <Route path="/stage" element={<Stage />} />
        <Route path="/remote" element={<Remote />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;