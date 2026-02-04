import IDEWorkspace from "@/components/ide/IDEWorkspace";
import { Helmet } from "react-helmet";

const IDE = () => {
  return (
    <>
      <Helmet>
        <title>AMIT–BODHIT IDE | Build Your Project</title>
        <meta
          name="description"
          content="The AMIT–BODHIT IDE workspace where you write real code with guided assistance. No shortcuts, just skill transfer."
        />
      </Helmet>
      <IDEWorkspace />
    </>
  );
};

export default IDE;
