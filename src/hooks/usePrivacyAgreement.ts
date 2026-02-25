import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';

export interface PrivacySection {
  title: string;
  body: string;
}

interface PrivacyAgreementState {
  sections: PrivacySection[];
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
}

export function usePrivacyAgreement(locale: string): PrivacyAgreementState {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      const titleCol = locale === 'en' ? 'title_en' : 'title_sv';
      const bodyCol = locale === 'en' ? 'body_en' : 'body_sv';

      const [agreementRes, metaRes] = await Promise.all([
        supabase
          .from('privacy_agreements')
          .select(`section_order, ${titleCol}, ${bodyCol}`)
          .order('section_order', { ascending: true }),
        supabase.from('privacy_meta').select('last_updated').limit(1).single(),
      ]);

      if (cancelled) return;

      if (agreementRes.error) {
        setError(agreementRes.error.message);
        setLoading(false);
        return;
      }

      const mapped: PrivacySection[] = (agreementRes.data ?? []).map((row: any) => ({
        title: row[titleCol],
        body: row[bodyCol],
      }));

      setSections(mapped);
      setLastUpdated(metaRes.data?.last_updated ?? null);
      setLoading(false);
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { sections, lastUpdated, loading, error };
}
