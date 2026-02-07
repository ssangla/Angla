import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../utils/colors';
import { extractInvoiceFromImage } from '../services/InvoiceLLMService';
import InvoiceStore from '../services/InvoiceStore';
import { InvoiceStatus, InvoiceCategory } from '../models/invoice-types';
import type { Invoice, LLMExtractionResult } from '../models/invoice-types';

interface Props {
  navigation: any;
}

export default function ScanInvoiceScreen({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<LLMExtractionResult | null>(null);

  const handleTakePhoto = async () => {
    // In production, use expo-camera or expo-image-picker
    // For now, simulate a captured image and trigger LLM processing
    Alert.alert(
      'Capturer la facture',
      'En production, cela ouvre la camera. Pour la demo, on utilise des donnees simulees.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Simuler un scan',
          onPress: () => processSimulatedImage(),
        },
      ]
    );
  };

  const handlePickFromGallery = async () => {
    // In production, use expo-image-picker for gallery
    Alert.alert(
      'Choisir une image',
      'En production, cela ouvre la galerie. Pour la demo, on utilise des donnees simulees.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Simuler un scan',
          onPress: () => processSimulatedImage(),
        },
      ]
    );
  };

  const processSimulatedImage = async () => {
    setImageUri('simulated://invoice-photo');
    setProcessing(true);

    try {
      // In production: convert image to base64 and send to LLM
      // const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      // const result = await extractInvoiceFromImage(base64, 'image/jpeg');
      const result = await extractInvoiceFromImage('', 'image/jpeg');

      setExtractionResult(result);

      if (result.success && result.data) {
        const store = InvoiceStore.getInstance();
        const invoice = store.addInvoice({
          imageUri: 'simulated://invoice-photo',
          supplierName: result.data.supplierName || '',
          supplierAddress: result.data.supplierAddress || '',
          invoiceNumber: result.data.invoiceNumber || '',
          invoiceDate: result.data.invoiceDate || new Date().toISOString().split('T')[0],
          dueDate: result.data.dueDate || '',
          lineItems: result.data.lineItems || [],
          subtotal: result.data.subtotal || 0,
          vatAmount: result.data.vatAmount || 0,
          totalAmount: result.data.totalAmount || 0,
          currency: result.data.currency || 'EUR',
          category: result.data.category || InvoiceCategory.OTHER,
          status: InvoiceStatus.PENDING_VALIDATION,
          scannedBy: 'Employe',
          validatedBy: null,
          notes: result.data.notes || '',
          confidence: result.confidence,
        });

        // Navigate to validation modal
        navigation.navigate('ValidateInvoice', { invoiceId: invoice.id });
      } else {
        Alert.alert(
          'Erreur d\'extraction',
          result.errors.join('\n') || 'Impossible de lire la facture. Veuillez reessayer.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="scan" size={48} color={colors.primary.main} />
        </View>
        <Text style={styles.title}>Scanner une facture</Text>
        <Text style={styles.subtitle}>
          Prenez en photo votre facture fournisseur.{'\n'}
          L'IA extraira automatiquement les donnees.
        </Text>
      </View>

      {processing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.processingText}>Analyse de la facture en cours...</Text>
          <Text style={styles.processingSubtext}>
            L'IA lit et extrait les donnees de votre facture
          </Text>
        </View>
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.mainButton} onPress={handleTakePhoto}>
            <View style={styles.buttonIconContainer}>
              <Ionicons name="camera" size={32} color={colors.text.inverse} />
            </View>
            <Text style={styles.mainButtonText}>Prendre une photo</Text>
            <Text style={styles.buttonSubtext}>Utilisez la camera pour capturer la facture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handlePickFromGallery}>
            <View style={[styles.buttonIconContainer, styles.secondaryIcon]}>
              <Ionicons name="images" size={32} color={colors.primary.main} />
            </View>
            <Text style={styles.secondaryButtonText}>Choisir depuis la galerie</Text>
            <Text style={styles.buttonSubtext}>Selectionnez une photo existante</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Conseils pour un bon scan</Text>
        <View style={styles.tipRow}>
          <Ionicons name="sunny-outline" size={20} color={colors.status.warning} />
          <Text style={styles.tipText}>Bonne luminosite, evitez les ombres</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="crop-outline" size={20} color={colors.status.info} />
          <Text style={styles.tipText}>Cadrez bien la facture entiere</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="hand-left-outline" size={20} color={colors.status.success} />
          <Text style={styles.tipText}>Posez la facture a plat sur une surface</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 8,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  mainButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryIcon: {
    backgroundColor: colors.primary.soft,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.soft,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  tipsContainer: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
});
