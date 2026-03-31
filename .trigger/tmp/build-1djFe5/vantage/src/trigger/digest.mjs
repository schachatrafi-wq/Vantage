import {
  Anthropic,
  TOPICS,
  createServerClient
} from "../../../chunk-XPDKXY62.mjs";
import {
  logger,
  schedules_exports
} from "../../../chunk-HXJ2YEWT.mjs";
import "../../../chunk-LM4VUS3I.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-X37OX4K2.mjs";

// src/trigger/digest.ts
init_esm();
var anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
var CLAUDE_MODEL = "claude-haiku-4-5-20251001";
var digestSchedulerTask = schedules_exports.task({
  id: "digest-scheduler",
  cron: "0 * * * *",
  maxDuration: 300,
  run: /* @__PURE__ */ __name(async () => {
    logger.info("Digest scheduler running");
    const supabase = createServerClient();
    const now = /* @__PURE__ */ new Date();
    const currentUTCHour = now.getUTCHours();
    const { data: subscriptions, error: subError } = await supabase.from("push_subscriptions").select("user_id, endpoint, p256dh, auth, timezone");
    if (subError) {
      logger.error("Failed to fetch push subscriptions", { error: subError.message });
      return;
    }
    if (!subscriptions || subscriptions.length === 0) return;
    let digestsSent = 0;
    for (const sub of subscriptions) {
      const userLocalHour = getLocalHour(currentUTCHour, sub.timezone);
      const isMorning = userLocalHour === 9;
      const isEvening = userLocalHour === 18;
      if (!isMorning && !isEvening) continue;
      const digestType = isMorning ? "morning" : "evening";
      const periodKey = `${sub.user_id}-${digestType}-${now.toISOString().slice(0, 13)}`;
      const { error: logError } = await supabase.from("digest_sent_log").insert({ period_key: periodKey, user_id: sub.user_id }).select();
      if (logError) {
        if (logError.code !== "23505") {
          logger.error("digest_sent_log insert error", { error: logError.message, periodKey });
        }
        continue;
      }
      const { data: userTopics } = await supabase.from("user_topics").select("topic_id").eq("user_id", sub.user_id);
      const topicIds = (userTopics ?? []).map((t) => t.topic_id);
      if (topicIds.length === 0) continue;
      const lookbackHours = isEvening ? 8 : 5;
      const since = new Date(Date.now() - lookbackHours * 3600 * 1e3);
      const { data: articleTopics } = await supabase.from("article_topics").select("article_id, relevance_score").in("topic_id", topicIds).gte("relevance_score", 0.5).order("relevance_score", { ascending: false }).limit(50);
      const articleIds = [...new Set((articleTopics ?? []).map((r) => r.article_id))];
      if (articleIds.length === 0) continue;
      const { data: articles } = await supabase.from("articles").select("id, title, url, source_domain, article_summaries(one_liner)").in("id", articleIds).gte("published_at", since.toISOString()).order("published_at", { ascending: false }).limit(10);
      if (!articles || articles.length === 0) continue;
      const topicNames = topicIds.map((id) => TOPICS.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
      try {
        const digest = await generateDigest(
          articles,
          topicNames,
          digestType
        );
        await sendDigestPush(sub.endpoint, sub.p256dh, sub.auth, digest, digestType);
        digestsSent++;
      } catch (err) {
        logger.error("Failed to send digest", { userId: sub.user_id, error: String(err) });
      }
    }
    logger.info("Digests sent", { count: digestsSent });
    return { sent: digestsSent };
  }, "run")
});
async function generateDigest(articles, topicNames, type) {
  const articleList = articles.slice(0, 5).map((a, i) => {
    const summaries = a.article_summaries;
    const oneLiner = Array.isArray(summaries) && summaries[0]?.one_liner;
    return `${i + 1}. ${a.title}${oneLiner ? ` — ${oneLiner}` : ""}`;
  }).join("\n");
  const prompt = `You are Vantage, an intelligent news assistant. Write a brief ${type === "morning" ? "morning" : "evening"} digest notification (max 120 characters) summarizing the most important stories for someone following: ${topicNames}.

Top stories:
${articleList}

Write only the notification body text. Be direct and informative. Start with the single most important theme or story.`;
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 80,
    messages: [{ role: "user", content: prompt }]
  });
  return message.content[0].type === "text" ? message.content[0].text.trim().slice(0, 120) : `${articles.length} new stories across your topics`;
}
__name(generateDigest, "generateDigest");
async function sendDigestPush(endpoint, p256dh, auth, body, type) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    logger.warn("VAPID keys not configured, skipping digest push");
    return;
  }
  const { default: webpush } = await import("../../../src-RFU3JDMY.mjs");
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const title = type === "morning" ? "☀️ Morning Briefing — Vantage" : "🌙 Evening Digest — Vantage";
  try {
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify({ title, body, data: { type: "digest" } })
    );
  } catch (err) {
    logger.error("sendDigestPush failed", { endpoint: endpoint.slice(0, 40), error: String(err) });
  }
}
__name(sendDigestPush, "sendDigestPush");
function getLocalHour(utcHour, timezone) {
  try {
    const date = /* @__PURE__ */ new Date();
    date.setUTCHours(utcHour, 0, 0, 0);
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false
    }).format(date);
    const parsed = parseInt(formatted, 10);
    return isNaN(parsed) ? utcHour : parsed % 24;
  } catch {
    logger.warn("Invalid timezone in push subscription", { timezone });
    return utcHour;
  }
}
__name(getLocalHour, "getLocalHour");
export {
  digestSchedulerTask
};
//# sourceMappingURL=digest.mjs.map
