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
              We believe that what you wear should reflect who you are and what
              you stand for. Every piece we create carries the spirit of our
              team.
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
                  href="/shop"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/tops"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Tops
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/bottoms"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Bottoms
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/accessories"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Who We Are
                </Link>
              </li>
              <li>
                <Link
                  href="/about#team"
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  Our Team
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
