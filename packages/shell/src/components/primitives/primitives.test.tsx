import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "./Button";
import Card from "./Card";
import StarRating from "./StarRating";
import Tag from "./Tag";
import PetWidgetFrame from "./PetWidgetFrame";

describe("Button", () => {
  it("is secondary by default and primary on request", () => {
    const { rerender } = render(<Button>Play</Button>);
    expect(screen.getByRole("button", { name: "Play" })).toHaveClass("btn");
    expect(screen.getByRole("button", { name: "Play" })).not.toHaveClass("btn-primary");

    rerender(<Button variant="primary">Play</Button>);
    expect(screen.getByRole("button", { name: "Play" })).toHaveClass("btn-primary");
  });

  it("keeps a caller's classes, defaults to type=button and forwards both disabled shapes", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button className="w-fit" onClick={onClick}>
        Feed
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Feed" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("w-fit");

    rerender(
      <Button className="w-fit" onClick={onClick} disabled>
        Feed
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Feed" })).toBeDisabled();
  });

  it("does not fire while disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Play
      </Button>,
    );
    screen.getByRole("button", { name: "Play" }).click();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Card", () => {
  it("is the light panel by default and the dark puzzle frame on request", () => {
    const { rerender } = render(<Card>Level 1</Card>);
    expect(screen.getByText("Level 1")).toHaveClass("panel");
    expect(screen.getByText("Level 1")).not.toHaveClass("panel-dark");

    rerender(<Card tone="dark">Level 1</Card>);
    expect(screen.getByText("Level 1")).toHaveClass("panel-dark");
  });
});

describe("StarRating", () => {
  it("gives the count as text and the glyphs as decoration", () => {
    render(<StarRating earned={2} />);

    const rating = screen.getByRole("img", { name: "2 of 3 stars" });
    expect(rating).toHaveTextContent("2/3");
    expect(rating.querySelector("[aria-hidden='true']")).toHaveTextContent("★★☆");
  });

  it("clamps an impossible count instead of drawing extra glyphs", () => {
    render(<StarRating earned={9} total={3} />);
    expect(screen.getByRole("img", { name: "3 of 3 stars" })).toHaveTextContent("★★★");
  });
});

describe("Tag", () => {
  it("is a neutral pill that can carry the action colour", () => {
    const { rerender } = render(<Tag>Search</Tag>);
    expect(screen.getByText("Search")).toHaveClass("rounded-pill");
    expect(screen.getByText("Search")).not.toHaveClass("bg-primary");

    rerender(<Tag tone="action">Search</Tag>);
    expect(screen.getByText("Search")).toHaveClass("bg-primary");
  });
});

describe("PetWidgetFrame", () => {
  it("keeps the caption in the card with whatever the widget mounts", () => {
    render(
      <PetWidgetFrame caption="Nipper is hungry">
        <span>sprite</span>
      </PetWidgetFrame>,
    );

    expect(screen.getByText("sprite").closest(".panel")).not.toBeNull();
    expect(screen.getByText("Nipper is hungry")).toBeInTheDocument();
  });
});
