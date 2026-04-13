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

    // Deduplicate by ServiceId so each unique post contributes its metrics only once
    const seen = new Set();
    const uniqueG = g.filter(r => {
      const sid = r.ServiceId;
      if (sid == null || sid === '') return true;
      if (seen.has(sid)) return false;
      seen.add(sid);
      return true;
    });

    // The listed metric columns are summed only once per unique ServiceId
    const impressions    = mode === 'exposures' ? maxNum(uniqueG, 'Impressions') : safeNum(uniqueG, 'Impressions');
    const engagement     = mode === 'exposures' ? maxNum(uniqueG, 'Engagement')  : safeNum(uniqueG, 'Engagement');
    const erSum          = uniqueG.reduce((s, r) => s + (Number(r.EngagementRate) || 0), 0);
    const engagementRate = erSum / uniqueG.length;

    result.push({
      groupKey:                  key,
      partner:                   g[0].Partner || '',
      rightsHolder:              g[0].PartnerExposureCreatorName || '',
      platform:                  g[0].ServiceType || '',
      contentType:               g[0].ContentType || '',
      message:                   g[0].Message || '',
      url:                       g[0].Url || '',
      date:                      g[0].PartnerExposureDate || '',
      organicPosts:              g.length,                             // all rows count
      followerCount:             maxNum(uniqueG, 'FollowerCount'),
      followerInteractionRate:   safeNum(uniqueG, 'FollowerInteractionRate'),
      impressions,
      projectedImpressions:      safeNum(uniqueG, 'ProjectedImpressions'),
      retweetCount:              safeNum(uniqueG, 'RetweetCount'),
      likeCount:                 safeNum(uniqueG, 'LikeCount'),
      replyCount:                safeNum(uniqueG, 'ReplyCount'),
      commentCount:              safeNum(uniqueG, 'CommentCount'),
      viewCount:                 safeNum(uniqueG, 'ViewCount'),
      loveCount:                 safeNum(uniqueG, 'LoveCount'),
      shareCount:                safeNum(uniqueG, 'ShareCount'),
      wowCount:                  safeNum(uniqueG, 'WowCount'),
      hahaCount:                 safeNum(uniqueG, 'HahaCount'),
      sadCount:                  safeNum(uniqueG, 'SadCount'),
      angryCount:                safeNum(uniqueG, 'AngryCount'),
      logoImpressions:           safeNum(uniqueG, 'LogoImpressions'),
      logoImpressionsUS:         safeNum(uniqueG, 'LogoImpressionsUS'),
      engagement,
      engagementRate,
      vodViews:                  safeNum(uniqueG, 'VODViews'),
      videoViews:                safeNum(uniqueG, 'ViewCount'),        // alias kept for DataTable compatibility
      reach:                     safeNum(uniqueG, 'Reach'),
      organicImpressions:        safeNum(uniqueG, 'OrganicImpressions'),
      paidImpressions:           safeNum(uniqueG, 'PaidImpressions'),
      projectedVideoViews:       safeNum(uniqueG, 'ProjectedVideoViews'),
      postValue:                 safeNum(uniqueG, 'PostValue'),
      interactions:              safeNum(uniqueG, 'Interactions'),
      engagementAndInteractions: safeNum(uniqueG, 'EngagementAndInteractions'),
      // value/financial fields use all rows (not deduplicated)
      brandValue:                safeNum(g, 'BrandExposureValue'),
      socialValue:               safeNum(g, 'PostValue'),
      // broadcast fields use all rows
      airings:                   safeNum(g, 'Airings'),
      durationSeconds:           safeNum(g, 'DurationSeconds'),
      viewers:                   safeNum(g, 'Viewers'),
      network:                   g[0].Network || '',
      program:                   g[0].Program || '',
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
    isTotal:                   true,
    groupKey:                  'Total',
    organicPosts:              sum('organicPosts'),
    followerCount:             sum('followerCount'),
    followerInteractionRate:   sum('followerInteractionRate'),
    impressions:               sum('impressions'),
    projectedImpressions:      sum('projectedImpressions'),
    retweetCount:              sum('retweetCount'),
    likeCount:                 sum('likeCount'),
    replyCount:                sum('replyCount'),
    commentCount:              sum('commentCount'),
    viewCount:                 sum('viewCount'),
    loveCount:                 sum('loveCount'),
    shareCount:                sum('shareCount'),
    wowCount:                  sum('wowCount'),
    hahaCount:                 sum('hahaCount'),
    sadCount:                  sum('sadCount'),
    angryCount:                sum('angryCount'),
    logoImpressions:           sum('logoImpressions'),
    logoImpressionsUS:         sum('logoImpressionsUS'),
    engagement:                sum('engagement'),
    engagementRate:            avg('engagementRate'),
    vodViews:                  sum('vodViews'),
    videoViews:                sum('videoViews'),
    reach:                     sum('reach'),
    organicImpressions:        sum('organicImpressions'),
    paidImpressions:           sum('paidImpressions'),
    projectedVideoViews:       sum('projectedVideoViews'),
    postValue:                 sum('postValue'),
    interactions:              sum('interactions'),
    engagementAndInteractions: sum('engagementAndInteractions'),
    brandValue:                sum('brandValue'),
    socialValue:               sum('socialValue'),
    airings:                   sum('airings'),
    durationSeconds:           sum('durationSeconds'),
    viewers:                   sum('viewers'),
    valuePrimary:              isRH ? sum('socialValue') : sum('brandValue'),
  };
}
