import React, { createContext, useContext, useState, ReactNode } from "react";
import { ROS_URL } from "@/config";

interface RosContextType {
  rosUrl: string;
  setRosUrl: (url: string) => void;
}

const RosContext = createContext<RosContextType | undefined>(undefined);

export const RosProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rosUrl, setRosUrl] = useState<string>(ROS_URL);

  return (
    <RosContext.Provider value={{ rosUrl, setRosUrl }}>
      {children}
    </RosContext.Provider>
  );
};

export const useRos = () => {
  const context = useContext(RosContext);
  if (!context) {
    throw new Error("useRos must be used within a RosProvider");
  }
  return context;
};
