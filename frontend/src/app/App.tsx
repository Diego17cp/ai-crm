import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { Toaster } from "sonner";
import {
	AdvisorMetricsPage,
	AllAppointmentsPage,
	AllCustomersPage,
	AllLeadsPage,
	AllLotsPage,
	AllProjectsPage,
	AllSalesPage,
	AllUsersPage,
	ChatbotPage,
	ChatsHistoryPage,
	CollectionsPage,
	DashboardPage,
	LiveChatPage,
	LoginPage,
	NotFoundPage,
	QuoteReviewPage,
	QuotesHistoryPage,
	SaleDetailPage,
	UnauthorizedPage,
} from "./routes";
import { AuthLayout } from "./layouts/AuthLayout";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ProtectedRoute } from "./routes/ProtectedRoute";

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
								<Route
									path="sales"
									element={
										<ProtectedRoute
											allowedRoles={["ADMIN"]}
										>
											<Outlet />
										</ProtectedRoute>
									}
								>
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
								<Route
									path="settings"
									element={
										<ProtectedRoute
											allowedRoles={["ADMIN"]}
										>
											<Outlet />
										</ProtectedRoute>
									}
								>
									<Route
										index
										element={
											<Navigate replace to="users" />
										}
									/>
									<Route
										path="users"
										element={<AllUsersPage />}
									/>
								</Route>
								<Route path="chats">
									<Route
										index
										element={
											<Navigate replace to="history" />
										}
									/>
									<Route
										path="history"
										element={<ChatsHistoryPage />}
									/>
									<Route
										path="live"
										element={<LiveChatPage />}
									/>
								</Route>
								<Route path="quotes">
									<Route
										index
										element={
											<Navigate replace to="history" />
										}
									/>
									<Route
										path="review"
										element={<QuoteReviewPage />}
									/>
									<Route
										path="history"
										element={<QuotesHistoryPage />}
									/>
								</Route>
								<Route path="metrics">
									<Route
										path=":idUsuario?"
										element={<AdvisorMetricsPage />}
									/>
								</Route>
							</Route>
							<Route path="*" element={<NotFoundPage />} />
							<Route
								path="/unauthorized"
								element={<UnauthorizedPage />}
							/>
						</Routes>
					</SidebarProvider>
				</AuthProvider>
			</ThemeProvider>
			<Toaster richColors closeButton />
		</BrowserRouter>
	);
}

export default App;
