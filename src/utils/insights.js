import { fmtNum, fmtCurrency, fmtPct } from './formatters';

function h(text, cls) {
  return `<mark class="${cls}">${text}</mark>`;
}

export function generateInsights(rows, groupBy) {
  if (!rows || rows.length === 0) return [];

  const isRH    = groupBy === 'rights_holders';
  const isAsset = groupBy === 'assets';
  const isBrand = groupBy === 'brands';
  const isExposures = groupBy === 'exposures';

  const byValueDesc = [...rows].sort((a,b) => (isRH ? b.socialValue - a.socialValue : b.brandValue - a.brandValue));
  const byERDesc    = [...rows].sort((a,b) => b.engagementRate - a.engagementRate);
  const byImpDesc   = [...rows].sort((a,b) => b.impressions - a.impressions);
  const byPostsDesc = [...rows].sort((a,b) => b.organicPosts - a.organicPosts);

  const top    = byValueDesc[0];
  const second = byValueDesc[1];
  const topER  = byERDesc[0];
  const topImp = byImpDesc[0];
  const bottomER = byERDesc[byERDesc.length - 1];

  const insights = [];

  // ── Card 1: Top performer by value ──
  if (top && second) {
    const valField = isRH ? 'socialValue' : 'brandValue';
    const valLabel = isRH ? 'Social Value' : 'Brand Value';
    const ratio = top[valField] / (second[valField] || 1);
    const impRatio = top.impressions / (second.impressions || 1);
    const name = isRH ? top.rightsHolder : isAsset ? top.groupKey : top.partner || top.groupKey;
    const name2 = isRH ? second.rightsHolder : isAsset ? second.groupKey : second.partner || second.groupKey;

    if (isRH) {
      insights.push(
        `${h(name,'gold')} is your top performer by a wide margin, driving over ${h(impRatio.toFixed(1)+'x','green')} the impressions and ${h(ratio.toFixed(1)+'x','green')} the ${h(valLabel,'green')} (${h(fmtCurrency(top[valField]),'green')}) of ${h(name2,'blue')}.`
      );
    } else if (isAsset) {
      insights.push(
        `${h(name,'gold')} is the clear leader in overall volume, generating the highest ${h('Impressions','green')} (${h(fmtNum(top.impressions),'green')}) and ${h('Engagements','green')} (${h(fmtNum(top.engagement),'green')}), contributing the most ${h(valLabel,'green')} at ${h(fmtCurrency(top[valField]),'green')}.`
      );
    } else {
      insights.push(
        `${h(name,'gold')} leads all ${isBrand ? 'sponsors' : 'posts'} with ${h(fmtCurrency(top[valField]),'green')} in ${h(valLabel,'green')} from ${h(top.organicPosts.toLocaleString(),'blue')} posts — ${h(ratio.toFixed(1)+'x','green')} more than the next closest.`
      );
    }
  }

  // ── Card 2: Engagement leaders ──
  if (topER) {
    const topER2 = byERDesc[1];
    const nameER  = isRH ? topER.rightsHolder : isAsset ? topER.groupKey : topER.partner || topER.groupKey;
    const nameER2 = topER2 ? (isRH ? topER2.rightsHolder : isAsset ? topER2.groupKey : topER2.partner || topER2.groupKey) : null;

    if (isRH && topER2) {
      insights.push(
        `${h(nameER,'gold')} (${h(fmtPct(topER.engagementRate),'green')}) and ${h(nameER2,'gold')} (${h(fmtPct(topER2.engagementRate),'green')}) have the highest ${h('engagement rates','green')}, indicating their content is resonating most effectively with the audience.`
      );
    } else if (isAsset) {
      insights.push(
        `The ${h(nameER,'gold')} is your most efficient asset for audience interaction. While it has ${topER.organicPosts < (byPostsDesc[byPostsDesc.length-1]?.organicPosts || 0) ? 'fewer' : 'the fewest'} posts, it achieves the highest ${h('Engagement Rate','green')} of ${h(fmtPct(topER.engagementRate),'green')}, well above any other category.`
      );
    } else {
      insights.push(
        `${h(nameER,'gold')} content achieves the strongest ${h('engagement rate','green')} at ${h(fmtPct(topER.engagementRate),'green')}, with ${h(fmtNum(topER.impressions),'blue')} impressions and ${h(fmtNum(topER.engagement),'green')} engagements.`
      );
    }
  }

  // ── Card 3: Opportunity / comparison ──
  if (isRH && top && second) {
    const valField = 'socialValue';
    const valLabel = 'Social Value';
    const similar = rows.find(r => {
      const rh = r.rightsHolder;
      return rh !== top.rightsHolder && Math.abs(r.organicPosts - top.organicPosts) / (top.organicPosts || 1) < 0.3;
    }) || second;
    const name  = top.rightsHolder;
    const name2 = similar.rightsHolder;
    const impR  = top.impressions / (similar.impressions || 1);
    const valR  = top[valField] / (similar[valField] || 1);
    insights.push(
      `Despite a similar number of ${h('Organic Posts','green')}, ${h(name,'gold')}'s strategy was far more effective than ${h(name2,'blue')}'s, generating over ${h(impR.toFixed(1)+'x','green')} the impressions and ${h(valR.toFixed(1)+'x','green')} the ${h(valLabel,'green')}.`
    );
  } else if (isAsset && bottomER && bottomER !== topER) {
    const name2 = bottomER.groupKey;
    const secondMost = byPostsDesc[1];
    const isSndMost = secondMost && secondMost.groupKey === name2;
    insights.push(
      `There is a significant opportunity to optimize ${h(name2,'gold')} content. ${isSndMost ? `Despite having the second-highest number of ${h('Organic Posts','gold')}, it` : 'It'} yields the lowest ${h('Engagement Rate','green')} at just ${h(fmtPct(bottomER.engagementRate),'green')}.`
    );
  } else if (topImp) {
    const nameImp = isRH ? topImp.rightsHolder : isAsset ? topImp.groupKey : topImp.partner || topImp.groupKey;
    const totalImp = rows.reduce((s,r) => s + r.impressions, 0);
    const pct = totalImp > 0 ? ((topImp.impressions / totalImp) * 100).toFixed(0) : 0;
    insights.push(
      `${h(nameImp,'gold')} drove the most ${h('impressions','green')} at ${h(fmtNum(topImp.impressions),'green')}, representing ${h(pct+'%','blue')} of total reach across all ${isRH ? 'rights holders' : isAsset ? 'asset types' : 'content'}.`
    );
  }

  return insights;
}
