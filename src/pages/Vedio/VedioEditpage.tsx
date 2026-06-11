import { Container } from "@mui/material";
import { useParams } from "react-router-dom";

import ComponentsVedioAddForm from "../../components/View/Vedio/ComponentsVedioAddForm";

const VedioEditpage = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="xl">
      <ComponentsVedioAddForm mode="edit" vedioId={id ?? ""} />
    </Container>
  );
};

export default VedioEditpage;
