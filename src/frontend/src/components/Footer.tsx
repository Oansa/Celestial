import { Heart, Mail, Code, HelpCircle, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Slogan Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/assets/generated/celestial-logo.png" 
                alt="Celestial Logo" 
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                Celestial
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
              From documenting local climate actions to funding global relief, we harness the power of 
              transparency and decentralization to turn proof into impact.
            </p>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Support
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                  <HelpCircle className="w-3 h-3" />
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  User Guide
                </a>
              </li>
            </ul>
          </div>

          {/* API Section */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Code className="w-4 h-4" />
              API
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Developer Portal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  SDKs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Us
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              <span>support@celestial.eco</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span>+1 (555) 123-EARTH</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>Global Community</span>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span>© 2025 Celestial. Built with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>for our planet using</span>
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline font-medium transition-colors"
            >
              caffeine.ai
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
