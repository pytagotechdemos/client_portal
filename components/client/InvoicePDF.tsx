import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Project, Client, Invoice } from "@prisma/client";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  brandDetails: {
    color: '#64748B',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    textAlign: 'right',
    marginBottom: 4,
  },
  invoiceId: {
    color: '#64748B',
    textAlign: 'right',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  valueLight: {
    marginBottom: 2,
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  marginBottom: {
    marginBottom: 20,
  },
  table: {
    width: 'auto',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  descCol: {
    width: '70%',
  },
  amountCol: {
    width: '30%',
    textAlign: 'right',
  },
  colHeader: {
    fontFamily: 'Helvetica-Bold',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  totalsBox: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
  },
  totalLabel: {
    color: '#64748B',
  },
  finalTotalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
  },
  finalTotalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    color: '#64748B',
    fontSize: 10,
  },
  footerTitle: {
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
  }
});

type InvoiceItem = { name: string; price: number };

interface ProjectWithClient extends Project {
  client: Client;
}

interface InvoicePDFProps {
  invoice: Invoice;
  project: ProjectWithClient;
}

export const InvoicePDF = ({ invoice, project }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>Pytagotech</Text>
          <Text style={styles.brandDetails}>123 Creative Street</Text>
          <Text style={styles.brandDetails}>Design City, DC 10001</Text>
          <Text style={styles.brandDetails}>hello@pytagotech.com</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>Invoice</Text>
          <Text style={styles.invoiceId}>INV-{invoice.id.substring(invoice.id.length - 6).toUpperCase()}</Text>
        </View>
      </View>

      {/* Bill To & Dates */}
      <View style={styles.section}>
        <View>
          <Text style={styles.label}>Billed To</Text>
          <Text style={styles.value}>{project.client.companyName || project.client.name}</Text>
          <Text style={styles.valueLight}>{project.client.contactName}</Text>
          <Text style={styles.valueLight}>{project.client.contactEmail}</Text>
          {project.client.phone && <Text style={styles.valueLight}>{project.client.phone}</Text>}
        </View>
        <View style={styles.rightAlign}>
          <View style={styles.marginBottom}>
            <Text style={styles.label}>Date Issued</Text>
            <Text style={styles.valueLight}>{new Date(invoice.createdAt).toLocaleDateString()}</Text>
          </View>
          <View>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.valueLight}>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Upon Receipt"}</Text>
          </View>
        </View>
      </View>

      {/* Project Ref */}
      <View style={styles.marginBottom}>
        <Text style={styles.label}>Project Reference</Text>
        <Text style={styles.valueLight}>{project.name}</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.descCol, styles.colHeader]}>Description</Text>
          <Text style={[styles.amountCol, styles.colHeader]}>Amount</Text>
        </View>
        
        {((invoice.items as unknown) as InvoiceItem[]).map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.descCol}>{item.name}</Text>
            <Text style={styles.amountCol}>${Number(item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>${Number(invoice.totalAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Total Due</Text>
            <Text style={styles.finalTotalValue}>${Number(invoice.totalAmount).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Footer Instructions */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Payment Instructions</Text>
        <Text>Please remit payment via Bank Transfer or PayPal to payments@pytagotech.com.</Text>
        <Text>If you have any questions about this invoice, please contact us.</Text>
      </View>

    </Page>
  </Document>
);
