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

export interface NewInvoiceEmailProps {
  clientName: string;
  projectName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  portalUrl: string;
  agencyName: string;
}

export const NewInvoiceEmail = ({
  clientName,
  projectName,
  invoiceNumber,
  totalAmount,
  dueDate,
  portalUrl,
  agencyName,
}: NewInvoiceEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New invoice {invoiceNumber} from {agencyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Invoice</Heading>
          
          <Text style={text}>Hi {clientName},</Text>
          
          <Text style={text}>
            We have generated a new invoice for <strong>{projectName}</strong>.
          </Text>

          <Section style={detailsContainer}>
            <Text style={detailsText}><strong>Invoice Number:</strong> {invoiceNumber}</Text>
            <Text style={detailsText}><strong>Total Amount:</strong> ${totalAmount.toLocaleString()}</Text>
            <Text style={detailsText}><strong>Due Date:</strong> {dueDate}</Text>
          </Section>

          <Section style={btnContainer}>
            <Button style={button} href={portalUrl}>
              View & Pay Invoice
            </Button>
          </Section>

          <Text style={footer}>
            Best regards,<br />
            {agencyName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewInvoiceEmail;

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

const detailsContainer = {
  backgroundColor: "#f9f9f9",
  padding: "16px",
  borderRadius: "4px",
  marginTop: "16px",
  marginBottom: "16px",
};

const detailsText = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 8px 0",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#10B981",
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
