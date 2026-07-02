import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Preview,
  Section,
  Heading,
} from "@react-email/components";

export interface NewDeliverableEmailProps {
  clientName: string;
  projectName: string;
  deliverableName: string;
  portalUrl: string;
  agencyName: string;
}

export const NewDeliverableEmail = ({
  clientName,
  projectName,
  deliverableName,
  portalUrl,
  agencyName,
}: NewDeliverableEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>A new deliverable is ready for your review: {deliverableName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Deliverable Ready</Heading>
          
          <Text style={text}>Hi {clientName},</Text>
          
          <Text style={text}>
            We've just uploaded a new deliverable for <strong>{projectName}</strong>. 
            The item <strong>{deliverableName}</strong> is now ready for your review.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={portalUrl}>
              View Deliverable
            </Button>
          </Section>

          <Text style={text}>
            You can leave comments or request changes directly in the client portal.
          </Text>

          <Text style={footer}>
            Best regards,<br />
            {agencyName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewDeliverableEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 40px 48px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#7C3AED",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "48px",
};
