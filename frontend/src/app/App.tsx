import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { Toaster } from "sonner";
import { AllAppointmentsPage, AllLeadsPage, AllLotsPage, AllProjectsPage, AllSalesPage, ChatbotPage, DashboardPage, LoginPage, SaleDetailPage } from "./routes";
import { AuthLayout } from "./layouts/AuthLayout";
import { ThemeProvider } from "./providers/ThemeProvider";

function App() {
	return (
		<BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route index element={<Navigate replace to="chat" />} />
              <Route path="/chat" element={<ChatbotPage />} />
              <Route path="auth/login" element={<LoginPage />} />
              <Route path="admin" element={<AuthLayout />}>
                <Route
                  index
                  element={<Navigate replace to="dashboard" />}
                />
                <Route
                  path="dashboard"
                  element={<DashboardPage />}
                />
                <Route path="inventory">
                  <Route index element={<Navigate replace to="projects" />} />
                  <Route path="projects" element={<AllProjectsPage />} />
                  <Route path="lots" element={<AllLotsPage />} />
                </Route>
                <Route path="clients">
                  <Route index element={<Navigate replace to="leads" />} />
                  <Route path="leads" element={<AllLeadsPage />} />
                </Route>
                <Route path="appointments" element={<AllAppointmentsPage />} />
                <Route path="sales">
                  <Route index element={<Navigate replace to="contracts" />} />
                  <Route path="contracts" element={<AllSalesPage />} />
                  <Route path="contract/:id" element={<SaleDetailPage />} />
                </Route>
              </Route>
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
			<Toaster richColors closeButton />
		</BrowserRouter>
	);
}

export default App;
