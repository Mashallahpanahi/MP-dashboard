// src/components/MyInfoModal.tsx
import { useEffect } from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaTimes,
} from "react-icons/fa";
import { TbDatabaseHeart } from "react-icons/tb";

interface MyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// YOUR CONTACT INFO — EDIT HERE
// ============================================
const OWNER_NAME = "Mashallah Panahi";
const PHONE_NUMBER = "0771464328";
const WHATSAPP_NUMBER = "0771464328"; // same number
const EMAIL = "mashallahpanahi44@gmail.com";
const QR_IMAGE = "/images/hesabpay.png"; // in public/images/
// WhatsApp link — 93 = Afghanistan country code
const WA_LINK = `https://wa.me/93${WHATSAPP_NUMBER.replace(/^0/, "")}`;

const MyInfoModal = ({ isOpen, onClose }: MyInfoModalProps) => {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
          title="Close"
        >
          <FaTimes className="h-4 w-4" />
        </button>

        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-6 pb-8 pt-8 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-3xl ring-1 ring-white/20 backdrop-blur-sm">
              <TbDatabaseHeart />
            </div>
            <div>
              <h2
                className="text-2xl font-bold tracking-wider"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                MP System
              </h2>
              <p className="text-xs text-blue-200">Management Portal</p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* BODY */}
        {/* ============================================ */}
        <div className="px-6 py-6">
          {/* Built by */}
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Built &amp; Maintained By
            </p>
            <p
              className="mt-1 text-2xl font-bold text-blue-900"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              {OWNER_NAME}
            </p>
          </div>

          {/* Message */}
          <p className="mb-6 text-center text-sm leading-relaxed text-gray-600">
            If you have any questions or problems, feel free to call
            and ask for help. I'm happy to assist you.
          </p>

          {/* Contact buttons */}
          <div className="space-y-3">
            {/* Phone */}
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FaPhoneAlt className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {PHONE_NUMBER}
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FaWhatsapp className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  WhatsApp
                </p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {WHATSAPP_NUMBER}
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-red-300 hover:bg-red-50/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FaEnvelope className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {EMAIL}
                </p>
              </div>
            </a>
          </div>

          {/* HesabPay QR */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Support via HesabPay
            </p>
            <p className="mb-3 mt-1 text-xs text-gray-500">
              Scan the QR code to send support
            </p>
            <div className="mx-auto flex w-44 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
              <img
                src={QR_IMAGE}
                alt="HesabPay QR Code"
                className="h-auto w-full object-contain"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 11px;">
                        QR image not found<br/>
                        <code style="font-size: 10px;">public/images/hesabpay.png</code>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-gray-400">
            © {new Date().getFullYear()} MP System — All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyInfoModal;