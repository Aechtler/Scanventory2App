import { useRouter } from 'expo-router';
import { AppActionSheet } from '@/shared/components/AppActionSheet';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useUIStore } from '@/shared/store/uiStore';

export function CampaignActionSheet() {
  const router = useRouter();
  const colors = useThemeColors();
  const visible = useUIStore((s) => s.campaignSheetVisible);
  const setCampaignSheetVisible = useUIStore((s) => s.setCampaignSheetVisible);
  const setCampaignSelectionRequested = useUIStore((s) => s.setCampaignSelectionRequested);

  return (
    <AppActionSheet
      visible={visible}
      onClose={() => setCampaignSheetVisible(false)}
      title="Kampagnen"
      items={[
        {
          label: 'Neue Kampagne',
          description: 'Items auswählen & speichern',
          icon: <Icons.Plus size={26} color="#ffffff" />,
          primary: true,
          onPress: () => setCampaignSelectionRequested(true),
        },
        {
          label: 'Kampagnen ansehen',
          description: 'Alle gespeicherten Kampagnen',
          icon: <Icons.Flag size={22} color={colors.textSecondary} />,
          onPress: () => router.push('/campaigns'),
        },
      ]}
    />
  );
}
