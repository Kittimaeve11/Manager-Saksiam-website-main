import { Container } from "@mui/material";
import { useParams } from "react-router-dom";

import ComponentsCompanyDirectorAddForm from "../../components/View/About/ComponentsCompanyDirectorAddForm";

const AboutCompanyDirectorEditpage = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="xl">
      <ComponentsCompanyDirectorAddForm mode="edit" directorId={id ?? ""} />
    </Container>
  );
};

export default AboutCompanyDirectorEditpage;
