export function aggregate(rows, mode) {
  const keyFn = {
    exposures:      r => r.Url || r.Id,
    rights_holders: r => r.PartnerExposureCreatorName,
    assets:         r => r.PartnerAssetLabel,
    brands:         r => r.Partner,
  }[mode] || (r => r.Url);

  const groups = new Map();
  for (const r of rows) {
    const k = keyFn(r) || 'Unknown';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  const result = [];
  for (const [key, g] of groups) {
    const safeNum = (arr, field) => arr.reduce((s, r) => s + (Number(r[field]) || 0), 0);
    const maxNum  = (arr, field) => Math.max(...arr.map(r => Number(r[field]) || 0));

    const impressions  = mode === 'exposures' ? maxNum(g, 'Impressions') : safeNum(g, 'Impressions');
    const engagement   = mode === 'exposures' ? maxNum(g, 'Engagement')  : safeNum(g, 'Engagement');
    const videoViews   = safeNum(g, 'ViewCount');
    const erSum        = g.reduce((s, r) => s + (Number(r.EngagementRate) || 0), 0);
    const engagementRate = erSum / g.length;

    result.push({
      groupKey:        key,
      partner:         g[0].Partner || '',
      rightsHolder:    g[0].PartnerExposureCreatorName || '',
      platform:        g[0].ServiceType || '',
      contentType:     g[0].ContentType || '',
      message:         g[0].Message || '',
      url:             g[0].Url || '',
      date:            g[0].PartnerExposureDate || '',
      organicPosts:    g.length,
      followerCount:   maxNum(g, 'FollowerCount'),
      impressions,
      engagement,
      engagementRate,
      videoViews,
      brandValue:      safeNum(g, 'BrandExposureValue'),
      socialValue:     safeNum(g, 'PostValue'),
      logoImpressions: safeNum(g, 'LogoImpressions'),
      // broadcast
      airings:         safeNum(g, 'Airings'),
      durationSeconds: safeNum(g, 'DurationSeconds'),
      viewers:         safeNum(g, 'Viewers'),
      network:         g[0].Network || '',
      program:         g[0].Program || '',
    });
  }

  return result;
}

export function buildTotalRow(rows, mode) {
  if (!rows.length) return null;
  const sum = f => rows.reduce((s, r) => s + (Number(r[f]) || 0), 0);
  const avg = f => sum(f) / rows.length;
  const isRH = mode === 'rights_holders';

  return {
    isTotal: true,
    groupKey: 'Total',
    organicPosts:    sum('organicPosts'),
    followerCount:   sum('followerCount'),
    impressions:     sum('impressions'),
    engagement:      sum('engagement'),
    engagementRate:  avg('engagementRate'),
    videoViews:      sum('videoViews'),
    brandValue:      sum('brandValue'),
    socialValue:     sum('socialValue'),
    airings:         sum('airings'),
    durationSeconds: sum('durationSeconds'),
    viewers:         sum('viewers'),
    valuePrimary:    isRH ? sum('socialValue') : sum('brandValue'),
  };
}
