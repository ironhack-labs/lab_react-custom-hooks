import { useAccordion } from "../hooks/useAccordion";

export function FAQItem() {
	const { isOpen, toggle } = useAccordion();

	return (
		<div>
			<button onClick={toggle} aria-expanded={isOpen}>
				{isOpen ? "Hide Answer" : "Show Answer"}
			</button>
			{isOpen && <p>This is the answer to the question.</p>}
		</div>
	);
}
