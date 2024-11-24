import { useColorContext } from "../../context/ColorContext";
function Footer() {
  const { colorScheme } = useColorContext();

  return (
    <footer>
      <div className=" text-center text-sm leading-relaxed">
        <a
          className={`${colorScheme.hover}`}
          href="mailto:nicholas@vmello.dev?subject=Hey handsome ;)"
        >
          nicholas@vmello.dev
        </a>
      </div>
    </footer>
  );
}

export default Footer;
