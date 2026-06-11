import { useEffect, useMemo, useState } from "react";

export const useArea = (apiFetch: any) => {
  const [areaList, setAreaList] = useState<any[]>([]);

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const res = await apiFetch(`/api/auther/areaapi`, {
          method: "GET",
        });
        const data = await res.json();
        setAreaList(data?.result || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchArea();
  }, []);

  const areaMap = useMemo(() => {
    const map: Record<number, string> = {};
    areaList.forEach((item) => {
      map[item.id] = item.name;
    });
    return map;
  }, [areaList]);

  return { areaList, areaMap };
};