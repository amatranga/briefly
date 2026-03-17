import { TopicWeightsEditor } from "@/components/TopicWeightsEditor";
import { LearnedTopicAffinities } from "@/components/LearnedTopicAffinities";
import type { Topic, TopicWeights, UserPreferences } from "@/lib/types";

type SettingsPanelProps = {
  showSettings: boolean;
  onToggle: () => void;
  topics: Topic[];
  topicWeights: TopicWeights;
  onTopicWeightsChange: (weights: TopicWeights) => void;
  userPreferences: UserPreferences | null;
  onResetPersonalization: () => void;
};

const SettingsPanel = ({
  showSettings,
  onToggle,
  topics,
  topicWeights,
  onTopicWeightsChange,
  userPreferences,
  onResetPersonalization,
}: SettingsPanelProps) => {
  return (
    <div style={{ marginTop: 12, marginBottom: 16 }}>
      <button
        onClick={onToggle}
        style={{
          border: "1px solid var(--border)",
          background: "transparent",
          borderRadius: 10,
          padding: "6px 10px",
          cursor: "pointer",
          color: "var(--text)",
        }}
      >
        {showSettings ? "Hide Settings" : "Show Settings"}
      </button>

      {showSettings && (
        <div className="card" style={{ marginTop: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Settings</h3>

          <TopicWeightsEditor
            topics={topics}
            weights={topicWeights}
            onChange={onTopicWeightsChange}
          />

          {userPreferences && (
            <>
              <LearnedTopicAffinities preferences={userPreferences} />

              <button
                onClick={onResetPersonalization}
                style={{
                  marginTop: 12,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: "var(--text)",
                }}
              >
                Reset Personalization
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { SettingsPanel };
