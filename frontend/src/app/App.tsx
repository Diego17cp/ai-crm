
import { BrowserRouter, Route, Routes } from "react-router";
// import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "sonner";
import { ChatbotPage } from "./routes";


function App() {

  return (
    <BrowserRouter>
      {/* <AuthProvider> */}
          <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              <Route path="/chat" element={<ChatbotPage />} />
          </Routes>
          <Toaster richColors closeButton />
      {/* </AuthProvider> */}
    </BrowserRouter>
  )
}

export default App
