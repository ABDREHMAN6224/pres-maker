"use client";

import {
  CopilotKit
} from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css"; 
import {Presentation} from "../components/present";
import "./styles.css";
import React, { useEffect } from "react";


const Demo = () => {
  const [numSlides, setNumSlides] = React.useState(5);
  const [inProgress, setInProgress] = React.useState(true);

  return (
    <CopilotKit url="/api/copilotkit/openai">
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Presentation Copilot",
          initial: "Hi you! 👋 I can give you a presentation on any topic.",
        }}
        clickOutsideToClose={false}
        onSubmitMessage={async (message) => {
            const numbers = message.match(/\d+/g);
            if (numbers && numbers.length > 0) {
              setNumSlides(parseInt(numbers[0]));
            }

        }}
        onInProgress={(status) => {
          setInProgress(status);
        }}
      >
        <Presentation numSlides={numSlides} done={inProgress}/>
      </CopilotSidebar>
    </CopilotKit>
  );
};

export default Demo;