import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors, gradients } from '@/utils/colors';

const CoupleSetupScreen: React.FC = () => {
  const { createNewCouple, joinExistingCouple, setIncome, profile, isLoading } =
    useAuth();
  const [step, setStep] = useState<'choice' | 'create' | 'join' | 'income'>(
    'choice'
  );
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [incomeValue, setIncomeValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const code = await createNewCouple();
      setGeneratedCode(code);
      setStep('create');
    } catch {
      Alert.alert('Erreur', 'Impossible de creer le couple');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le code d\'invitation');
      return;
    }
    try {
      setLoading(true);
      const partnerName = await joinExistingCouple(inviteCode.trim());
      Alert.alert('Bienvenue !', `Vous etes maintenant en couple avec ${partnerName}`);
      setStep('income');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi sur Angla ! Utilise ce code : ${generatedCode}\n\nTelecharge l'app : https://angla.app`,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleSetIncome = async () => {
    const income = parseFloat(incomeValue);
    if (isNaN(income) || income < 0) {
      Alert.alert('Erreur', 'Veuillez saisir un revenu valide');
      return;
    }
    try {
      setLoading(true);
      await setIncome(income);
      // AuthContext will reload and navigate to main app
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre a jour le revenu');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeDone = () => {
    setStep('income');
  };

  // Step 1: Choose to create or join
  if (step === 'choice') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.greeting}>
            Bienvenue{profile?.name ? `, ${profile.name}` : ''} !
          </Text>
          <Text style={styles.title}>Configurez votre couple</Text>
          <Text style={styles.subtitle}>
            Angla utilise vos revenus pour calculer une repartition equitable des
            depenses.
          </Text>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleCreate}
            disabled={loading}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.optionGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.optionTitle}>Creer un couple</Text>
                  <Text style={styles.optionDescription}>
                    Generez un code d'invitation pour votre partenaire
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCardSecondary}
            onPress={() => setStep('join')}
            disabled={loading}
          >
            <Text style={styles.optionTitleSecondary}>
              Rejoindre un couple
            </Text>
            <Text style={styles.optionDescriptionSecondary}>
              Entrez le code d'invitation de votre partenaire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2a: Show generated invite code
  if (step === 'create') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Votre code d'invitation</Text>
          <Text style={styles.subtitle}>
            Partagez ce code avec votre partenaire pour qu'il/elle rejoigne votre
            couple.
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{generatedCode}</Text>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
            <Text style={styles.shareButtonText}>Partager le code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleCodeDone}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.buttonGradient}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2b: Enter invite code to join
  if (step === 'join') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Rejoindre un couple</Text>
          <Text style={styles.subtitle}>
            Entrez le code de 6 caracteres que votre partenaire vous a partage.
          </Text>

          <TextInput
            style={styles.codeInput}
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            placeholder="EX: A7XK2M"
            placeholderTextColor={colors.text.disabled}
            maxLength={6}
            autoCapitalize="characters"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={loading}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Rejoindre</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep('choice')}>
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 3: Set income
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Votre revenu mensuel</Text>
        <Text style={styles.subtitle}>
          Cela permet de calculer votre part equitable des depenses. Cette
          information reste privee.
        </Text>

        <View style={styles.incomeInputContainer}>
          <TextInput
            style={styles.incomeInput}
            value={incomeValue}
            onChangeText={setIncomeValue}
            placeholder="2500"
            placeholderTextColor={colors.text.disabled}
            keyboardType="numeric"
            editable={!loading}
          />
          <Text style={styles.currencyLabel}>EUR / mois</Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, loading && styles.buttonDisabled]}
          onPress={handleSetIncome}
          disabled={loading}
        >
          <LinearGradient
            colors={gradients.success}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Commencer</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  optionGradient: {
    padding: 24,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.inverse,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  optionCardSecondary: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  optionTitleSecondary: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 4,
  },
  optionDescriptionSecondary: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  codeContainer: {
    backgroundColor: colors.primary.soft,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary.dark,
    letterSpacing: 8,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.main,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 16,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    letterSpacing: 8,
    marginBottom: 24,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  backText: {
    color: colors.primary.light,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  incomeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  incomeInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: 12,
  },
});

export default CoupleSetupScreen;
