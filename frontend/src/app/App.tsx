import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { Toaster } from "sonner";
import {
	AllAppointmentsPage,
	AllCustomersPage,
	AllLeadsPage,
	AllLotsPage,
	AllProjectsPage,
	AllSalesPage,
	ChatbotPage,
	CollectionsPage,
	DashboardPage,
	LoginPage,
	SaleDetailPage,
} from "./routes";
import { AuthLayout } from "./layouts/AuthLayout";
import { ThemeProvider } from "./providers/ThemeProvider";
import { NotFound } from "./routes/NotFound";

function App() {
	return (
		<BrowserRouter>
			<ThemeProvider>
				<AuthProvider>
					<SidebarProvider>
						<Routes>
							<Route
								index
								element={<Navigate replace to="chat" />}
							/>
							<Route path="/chat" element={<ChatbotPage />} />
							<Route path="auth/login" element={<LoginPage />} />
							<Route path="admin" element={<AuthLayout />}>
								<Route
									index
									element={
										<Navigate replace to="dashboard" />
									}
								/>
								<Route
									path="dashboard"
									element={<DashboardPage />}
								/>
								<Route path="inventory">
									<Route
										index
										element={
											<Navigate replace to="projects" />
										}
									/>
									<Route
										path="projects"
										element={<AllProjectsPage />}
									/>
									<Route
										path="lots"
										element={<AllLotsPage />}
									/>
								</Route>
								<Route path="clients">
									<Route
										index
										element={
											<Navigate replace to="leads" />
										}
									/>
									<Route
										path="leads"
										element={<AllLeadsPage />}
									/>
									<Route
										path="active"
										element={<AllCustomersPage />}
									/>
								</Route>
								<Route
									path="appointments"
									element={<AllAppointmentsPage />}
								/>
								<Route path="sales">
									<Route
										index
										element={
											<Navigate replace to="contracts" />
										}
									/>
									<Route
										path="contract/:id"
										element={<SaleDetailPage />}
									/>
									<Route
										path="contracts"
										element={<AllSalesPage />}
									/>
									<Route
										path="installments"
										element={<CollectionsPage />}
									/>
								</Route>
							</Route>
							<Route path="*" element={<NotFound />} />
						</Routes>
					</SidebarProvider>
				</AuthProvider>
			</ThemeProvider>
			<Toaster richColors closeButton />
		</BrowserRouter>
	);
}

export default App;
