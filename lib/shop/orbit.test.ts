import assert from "node:assert/strict";
import { test } from "node:test";
import { nearestPose, normalizeYaw, orbitFrame, shortestTurn } from "./orbit";

test("a full turn hands off at the thin point and lands wide on each side", () => {
  const front = orbitFrame(0);
  assert.equal(front.layer.angle, "front");
  assert.equal(front.label, "Front");
  assert.ok(front.layer.squeeze > 0.95);

  const leaving = orbitFrame(40);
  const arriving = orbitFrame(50);
  assert.equal(leaving.layer.angle, "front");
  assert.equal(arriving.layer.angle, "right");
  assert.ok(leaving.layer.squeeze < 0.45);
  assert.ok(arriving.layer.squeeze < 0.45);
  assert.ok(Math.abs(leaving.layer.squeeze - arriving.layer.squeeze) < 0.08);
  assert.equal(leaving.label, "Turning");

  const right = orbitFrame(90);
  assert.equal(right.layer.angle, "right");
  assert.equal(right.label, "Right side");
  assert.ok(right.layer.squeeze > 0.95);

  assert.equal(orbitFrame(180).layer.angle, "back");
  assert.equal(orbitFrame(270).layer.angle, "left");
  assert.equal(orbitFrame(359).layer.angle, "front");
  assert.equal(orbitFrame(-20).layer.angle, "front");
});

test("the camera settles on the nearest view and takes the short way around", () => {
  assert.equal(nearestPose(10), 0);
  assert.equal(nearestPose(80), 90);
  assert.equal(nearestPose(350), 0);
  assert.equal(nearestPose(-10), 0);
  assert.equal(shortestTurn(350, 90), 100);
  assert.equal(shortestTurn(10, 270), -100);
  assert.equal(normalizeYaw(-90), 270);
});
