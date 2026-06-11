import { useParams } from "react-router-dom";

import ComponentsMissionAddForm from "../../components/View/About/ComponentsMissionAddForm";

const AboutMissionEditpage = () => {
  const { id } = useParams();

  return <ComponentsMissionAddForm missionId={id} mode="edit" />;
};

export default AboutMissionEditpage;
