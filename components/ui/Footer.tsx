import Link from "next/link";
import { Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-200">
      <div className="container-wide section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-3xl text-white mb-4">
              Revolution
            </h3>
            <p className="text-brand-300 max-w-md leading-relaxed">
              Equal pay. 100% profit sharing. Full transparency. We're building 
              proof that another way is possible. When you buy from us, you're 
              voting for a different kind of capitalism.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-brand-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-brand-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-medium mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop/experience"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Dressing room
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/experience?slot=top"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Tops
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/experience?slot=bottom"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Bottoms
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/experience?slot=feet"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Footwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-medium mb-4">The Revolution</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/mission"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Our Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Our People
                </Link>
              </li>
              <li>
                <Link
                  href="/transparency"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Our Finances
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-500 text-sm">
            © {new Date().getFullYear()} Revolution Commerce. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-brand-500 hover:text-brand-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-brand-500 hover:text-brand-300 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
