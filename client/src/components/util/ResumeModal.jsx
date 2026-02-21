import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useColorContext } from "../../context/ColorContext";

const RESUME_PATH = "/morelloResume.pdf";

function ResumeModal({ isOpen, onClose }) {
  const { colorScheme, selectedTheme } = useColorContext();
  const isDark = selectedTheme === "dark";

  // Lock body scroll and listen for Escape
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-8 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          >
            <div
              className={`pointer-events-auto flex flex-col w-full max-w-4xl h-[70vh] sm:h-[85vh] rounded-lg border overflow-hidden ${
                isDark
                  ? "bg-[#0a0a0a] border-[#222]"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${
                  isDark ? "border-[#222]" : "border-gray-200"
                }`}
              >
                <span
                  className={`text-sm font-medium truncate ${colorScheme.title}`}
                >
                  morelloResume.pdf
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={RESUME_PATH}
                    download="morelloResume.pdf"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-300 ${colorScheme.linkBtn}`}
                  >
                    <i className="fa-solid fa-arrow-down-to-line" />
                    Download
                  </a>
                  <button
                    onClick={onClose}
                    className={`p-1.5 rounded-md transition-colors duration-200 ${
                      isDark
                        ? "text-gray-500 hover:text-white hover:bg-white/10"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <i className="fa-solid fa-xmark text-sm" />
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 min-h-0">
                <object
                  data={`${RESUME_PATH}#toolbar=0`}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <iframe
                    src={`${RESUME_PATH}#toolbar=0`}
                    title="Resume"
                    className="w-full h-full border-0"
                  />
                </object>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ResumeModal;
