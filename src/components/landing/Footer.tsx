
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-blue-500 text-white py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Dashboard</h3>
            <p className="text-sm text-blue-100">
              Making voter data accessible and actionable for campaigns of all sizes.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Demo</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-400 mt-8 pt-8 text-center text-blue-100">
          <p>&copy; {new Date().getFullYear()} Dashboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
