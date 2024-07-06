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
            // searchmessage for number of slides user asked for  ....
            const numbers = message.match(/\d+/g);
            if (numbers && numbers.length > 0) {
              setNumSlides(parseInt(numbers[0]));
            }

        }}
      >
        <Presentation numSlides={numSlides}/>
      </CopilotSidebar>
    </CopilotKit>
  );
};

export default Demo;