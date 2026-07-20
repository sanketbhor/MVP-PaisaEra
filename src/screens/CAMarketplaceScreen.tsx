import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import BookCASheet from '../components/BookCASheet';
import { colors, fonts, radii } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { CA_LISTINGS } from '../content/caMarketplaceContent';
import type { CAListing } from '../content/caMarketplaceContent';

interface Props {
  onBack: () => void;
}

export default function CAMarketplaceScreen({ onBack }: Props) {
  const [bookingTarget, setBookingTarget] = useState<CAListing | null>(null);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Talk to a CA</Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Sab CA verified hain. Agar PaisaEra ko commission milta hai toh saaf likha hota hai — chupa
            hua kuch nahi.
          </Text>
        </View>

        {CA_LISTINGS.map((ca) => (
          <Card key={ca.id} style={[styles.caCard, ca.sponsored && styles.caCardSponsored]}>
            <View style={styles.identityRow}>
              <View style={[styles.avatar, ca.sponsored && styles.avatarSponsored]}>
                <Text style={[styles.avatarText, ca.sponsored && styles.avatarTextSponsored]}>{ca.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.caName}>{ca.name}</Text>
                  {ca.sponsored ? (
                    <Text style={styles.sponsoredTag}>SPONSORED</Text>
                  ) : ca.verified ? (
                    <Text style={styles.verifiedTag}>✓ verified</Text>
                  ) : null}
                </View>
                <Text style={styles.caMeta}>
                  {ca.specialty} · {ca.yearsExperience} saal · ⭐ {ca.rating}
                </Text>
              </View>
            </View>
            <View style={styles.footerRow}>
              <View style={styles.commissionPill}>
                <Text style={styles.commissionText}>Commission: {formatINR(ca.commissionToPaisaEra)} to PaisaEra</Text>
              </View>
              <Pressable onPress={() => setBookingTarget(ca)} accessibilityRole="button" style={styles.bookBtn}>
                <Text style={styles.bookBtnText}>Book · {formatINR(ca.bookingPrice)}</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        <Text style={styles.footnote}>
          "Sponsored" ka matlab CA ne visibility ke liye pay kiya — recommendation nahi. Ratings asli
          users ke hain.
        </Text>
      </ScrollView>

      <BookCASheet
        visible={!!bookingTarget}
        caName={bookingTarget?.name ?? null}
        onClose={() => setBookingTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: { fontSize: 17 },
  title: { fontFamily: fonts.sans, fontSize: 17, color: colors.textPrimary },
  banner: { backgroundColor: colors.insightBadgeBg, borderRadius: 16, padding: 13, marginBottom: 14 },
  bannerText: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: colors.heroDark },
  caCard: { marginBottom: 12 },
  caCardSponsored: { borderWidth: 1, borderColor: 'rgba(201,162,63,.4)' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSponsored: { backgroundColor: '#f0ead8' },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.hero },
  avatarTextSponsored: { color: colors.warnText },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  caName: { fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary },
  verifiedTag: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.hero },
  sponsoredTag: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    color: colors.warnText,
    backgroundColor: colors.warnBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  caMeta: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  commissionPill: { backgroundColor: '#f0ead8', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  commissionText: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted },
  bookBtn: { backgroundColor: colors.hero, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 7 },
  bookBtnText: { fontFamily: fonts.sansBold, fontSize: 12, color: '#fff' },
  footnote: { fontFamily: fonts.sansRegular, fontSize: 11.5, lineHeight: 17, color: colors.textMuted, marginTop: 2 },
});
