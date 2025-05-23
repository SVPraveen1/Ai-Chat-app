import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Github } from 'lucide-react';

function Footer() {
  return (    <footer className="bg-slate-800 border-t border-slate-700 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-3">
              <MessageSquare className="text-blue-500 h-6 w-6 mr-2" />
              <h3 className="font-bold text-white">Copilot Chat AI</h3>
            </div>
            <p className="text-slate-400">
              Your intelligent AI chat assistant powered by advanced machine learning.
            </p>
          </div>          <div className="text-center">
            <h3 className="font-bold text-white mb-3">Quick Links</h3>
            <ul className="flex justify-center space-x-4">
              <li>
                <Link to="/" className="text-slate-400 hover:text-blue-400">Home</Link>
              </li>
              <li>
                <Link to="/chat" className="text-slate-400 hover:text-blue-400">Chat</Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-blue-400">Profile</Link>
              </li>
            </ul>
          </div>          <div className="text-center md:text-right">
            <h3 className="font-bold text-white mb-3">Connect</h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="https://github.com/SVPraveen1/ai-chat-app" className="text-slate-400 hover:text-blue-400">
                <Github className="h-5 w-5" />
              </a>
              {/* <a href="mailto:shyamkaruparthi@gmail.com" className="text-slate-400 hover:text-blue-400">
                <Mail className="h-5 w-5" />
              </a> */}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Copilot Chat AI. All rights reserved.
        </div>
      </div>    </footer>
  );
}

export default Footer;
