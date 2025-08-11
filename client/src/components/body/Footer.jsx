import { useColorContext } from "../../context/ColorContext";
function Footer() {
  const { colorScheme } = useColorContext();

  return (
    <footer>
      <div className=" text-center text-sm leading-relaxed p-5">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className={`${colorScheme.hover} ${colorScheme.logo}`}
          href="mailto:nicholas@vmello.dev"
        >
          nicholas@vmello.dev
        </a>
      </div>
    </footer>
  );
}

export default Footer;
