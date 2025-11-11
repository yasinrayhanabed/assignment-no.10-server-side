import { FiFacebook, FiInstagram, FiLinkedin, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold">LearnHub</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              Empowering learners worldwide with quality online education. 
              Join thousands of students in their journey to success.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-slate-300 hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="/courses" className="text-slate-300 hover:text-blue-400 transition-colors">Courses</a></li>
              <li><a href="/about" className="text-slate-300 hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 bg-slate-700 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                aria-label="Facebook"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-slate-700 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-slate-700 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-slate-700 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                aria-label="Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2024 LearnHub. All rights reserved. Built with ❤️ for learners everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;