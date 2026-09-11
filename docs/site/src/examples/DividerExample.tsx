import { Divider } from "@coderlifenet/ui-core";
import SubpathDivider from "@coderlifenet/ui-core/Divider";

export default function DividerExample() {
  return (
    <div className="divider-fixture">
      <p className="eyebrow">Design review / fixture</p>
      <h3>A little separation.</h3>
      <p>
        Give related ideas a shared space, and distinct ideas room to breathe.
      </p>
      <Divider />
      <p>Root export above. Subpath export below.</p>
      <SubpathDivider variant="middle" />
      <p className="muted">No component-specific Coder Life additions.</p>
    </div>
  );
}
