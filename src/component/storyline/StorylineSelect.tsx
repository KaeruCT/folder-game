import "./StorylineSelect.scss";
import { getAllStorylines } from "../../model/game";
import type { Action } from "../../reducer";

interface Props {
    dispatch: React.Dispatch<Action>;
}

function StorylineSelect({ dispatch }: Props) {
    const storylines = getAllStorylines();

    return (
        <div className="storyline-select">
            <h1>Root</h1>
            <p className="storyline-subtitle">Choose your storyline</p>
            <div className="storyline-list">
                {storylines.map((storyline) => (
                    <button
                        key={storyline.id}
                        type="button"
                        className="storyline-card"
                        onClick={() => dispatch({ type: "SELECT_STORYLINE", payload: storyline.id })}
                    >
                        <div className="storyline-card__topline">
                            <div className="storyline-card__name">{storyline.name}</div>
                            {storyline.playtime && <div className="storyline-card__time">{storyline.playtime}</div>}
                        </div>
                        {storyline.hook && <div className="storyline-card__hook">{storyline.hook}</div>}
                        <div className="storyline-card__desc">{storyline.description}</div>
                        {storyline.tags && (
                            <div className="storyline-card__tags">
                                {storyline.tags.map((tag) => (
                                    <span key={tag}>{tag}</span>
                                ))}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default StorylineSelect;
