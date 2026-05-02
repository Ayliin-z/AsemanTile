import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import ProductPage from './pages/ProductPage'
import ProductsPage from './pages/ProductsPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerPanel from './pages/CustomerPanel'
import PartnerPanel from './pages/PartnerPanel'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import EmployeePanel from './pages/EmployeePanel'
import CreateQuotePage from './pages/CreateQuotePage'
import QuotesListPage from './pages/QuotesListPage'

// Import Protected Routes
import ProtectedRoute from './components/ProtectedRoute/AdminRoute'
import CustomerProtectedRoute from './components/ProtectedRoute/CustomerRoute'
import PartnerProtectedRoute from './components/ProtectedRoute/PartnerRoute'
import EmployeeProtectedRoute from './components/ProtectedRoute/EmployeeRoute'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        
        {/* Protected Routes */}
        <Route path="/admin/*" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/customer" element={<CustomerProtectedRoute><CustomerPanel /></CustomerProtectedRoute>} />
        <Route path="/partner" element={<PartnerProtectedRoute><PartnerPanel /></PartnerProtectedRoute>} />
        <Route path="/employee" element={<EmployeeProtectedRoute><EmployeePanel /></EmployeeProtectedRoute>} />
        <Route path="/employee/create-quote" element={<EmployeeProtectedRoute><CreateQuotePage /></EmployeeProtectedRoute>} />
        <Route path="/employee/quotes" element={<EmployeeProtectedRoute><QuotesListPage /></EmployeeProtectedRoute>} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
