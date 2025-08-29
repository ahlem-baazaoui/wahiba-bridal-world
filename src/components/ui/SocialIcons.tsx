import { Facebook, Instagram, PhoneCall } from "lucide-react";
import React from "react";
// Import TikTok icon from react-icons
import { FaTiktok } from "react-icons/fa";

export const SocialIcons = () => (
  <div className="flex gap-4 items-center">
    <a href="https://www.facebook.com/EspaceWahibacoif/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
      <Facebook className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors" />
    </a>
    <a href="https://www.instagram.com/wahiba_bridal_world/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
      <Instagram className="w-6 h-6 text-pink-500 hover:text-pink-700 transition-colors" />
    </a>
    {/* TikTok icon */}
    <a href="https://www.tiktok.com/@wahiba_bridal_world" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
      <FaTiktok className="w-6 h-6 text-black hover:text-gray-700 transition-colors" />
    </a>
    <a href="tel:+21658450691" aria-label="Phone">
      <PhoneCall className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors" />
    </a>
  </div>
);

export default SocialIcons;
