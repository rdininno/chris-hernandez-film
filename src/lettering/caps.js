export const CAP = 140;

const round = (n) => Math.round(n * 100) / 100;

export function buildCaps(weight) {
  const h = weight / 2;
  const G = {};

  {
    const adv = 118;
    G.H = { adv, d: `M${h},0V${CAP} M${adv - h},0V${CAP} M${h},70H${adv - h}` };
  }

  {
    const adv = 120,
      cx = 70,
      cy = 70,
      r = 70 - h,
      a = Math.PI / 4;
    const x = cx + r * Math.cos(a);
    G.C = {
      adv,
      d: `M${round(x)},${round(cy - r * Math.sin(a))} A${round(r)},${round(r)} 0 1 0 ${round(x)},${round(cy + r * Math.sin(a))}`,
    };
  }

  {
    const adv = 120,
      mid = 78,
      r = (mid - h) / 2,
      bx = adv - h - r;
    const x0 = h + (adv - 2 * h) * 0.42,
      x1 = adv - h;
    const slope = (x1 - x0) / (CAP - mid);
    G.R = {
      adv,
      d: `M${h},${CAP}V${h}H${round(bx)}A${round(r)},${round(r)} 0 0 1 ${round(bx)},${mid}H${h} M${round(x0)},${mid}L${round(x1 + slope * weight)},${CAP + weight}`,
    };
  }

  G.I = { adv: weight, d: `M${h},0V${CAP}` };

  {
    const adv = 112,
      r = (70 - h) / 2,
      lx = h + r,
      rx = adv - h - r;
    G.S = {
      adv,
      d: `M${adv},${h}H${round(lx)}A${round(r)},${round(r)} 0 0 0 ${round(lx)},70H${round(rx)}A${round(r)},${round(r)} 0 0 1 ${round(rx)},${CAP - h}H0`,
    };
  }

  {
    const adv = 104;
    G.E = {
      adv,
      d: `M${adv},${h}H${h}V${CAP - h}H${adv} M${h},70H${adv - 12}`,
    };
  }

  {
    const adv = 124;
    G.N = {
      adv,
      d: `M${h},${CAP}V0 M${h},0L${adv - h},${CAP} M${adv - h},${CAP}V0`,
    };
  }

  {
    const adv = 134,
      half = adv / 2;
    let a0 = h;
    for (let i = 0; i < 6; i++) a0 = h / Math.sin(Math.atan2(CAP, half - a0));
    const xAt = (y) => a0 + ((CAP - y) / CAP) * (half - a0);
    const xl = a0 - (weight * (half - a0)) / CAP;
    G.A = {
      adv,
      d: `M${round(xl)},${CAP + weight}L${half},0L${round(adv - xl)},${CAP + weight} M${round(xAt(98))},98H${round(adv - xAt(98))}`,
    };
  }

  {
    const adv = 122,
      r = 70 - h,
      bx = adv - h - r;
    G.D = {
      adv,
      d: `M${h},${CAP - h}V${h}H${round(bx)}A${round(r)},${round(r)} 0 0 1 ${round(bx)},${CAP - h}Z`,
    };
  }

  {
    const adv = 112;
    G.Z = { adv, d: `M0,${h}H${adv}L0,${CAP - h}H${adv}` };
  }

  return G;
}
