import { useColorContext } from "../../context/ColorContext";
function Footer() {
  const { colorScheme } = useColorContext();

  return (
    <footer>
      <div className={`h-px bg-gradient-to-r ${colorScheme.divider}`} />
      <div className="text-center text-sm leading-relaxed p-5 space-y-2">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className={`${colorScheme.hover} ${colorScheme.logo} font-mono text-xs tracking-wide`}
          href="mailto:nicholas@vmello.dev"
        >
          nicholas@vmello.dev
        </a>
        <p className={`${colorScheme.text} text-xs opacity-50`}>
          &copy; 2024 vmello.dev
        </p>
      </div>
    </footer>
  );
}

export default Footer;
