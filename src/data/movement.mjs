// Movement Table 7A, LEG10200 PDF 67. Visual transcription, 21 September 2026.
// The basic game's Action Time Table (PDF 69) prints the same numbers pre-summed:
// forward 1 + low crouch 1 = 2, backward 3 + hands and knees 2 = 5, and so on.
// See docs/movement-reference.md §4.
export const movementSource=Object.freeze({book:'LEG10200',pdfPage:67,table:'7A',revision:1,status:'visual-transcription'});

// Cost per hex entered, by the direction of travel relative to the mover's facing.
export const baseMovementCosts=Object.freeze({forward:1,backward:3,oblique:4,sideways:5});

// Additive modifiers. Each group contributes at most one row except `miscellaneous`,
// which the table lists as independent conditions. `none` is not printed; it names the
// unmodified case so an absent group is a stated choice rather than a silent zero.
export const movementModifiers=Object.freeze({
  stance:Object.freeze({standing:0,'low-crouch':1,'hands-and-knees':2,'belly-crawl':3}),
  slope:Object.freeze({none:0,'across-slope':1,downhill:1,stairs:1,uphill:2}),
  cover:Object.freeze({none:0,'light-brush':1,'medium-brush':2,'dense-brush':3}),
  water:Object.freeze({none:0,'1-foot':1,'2-feet':2,'3-feet':4,'4-feet':10}),
  injury:Object.freeze({none:0,'above-waist':2,'below-waist':12}),
  miscellaneous:Object.freeze({'concertina-wire':5,'dry-sand':1,'icy-surface':2,'scuba-flippers':3,'snow-shoes':2})
});

// Table 4D, PDF 63. The printed table shades the region that reads "-5 (No Maximum Aim)";
// every unshaded entry, including the blank block printed as "-10 (Maximum 2 Impulse
// Aim)", restricts the shot's Aim Time. The ported numeric table carries no shading, so
// the boundary is recorded here: the first range column, in 2-yard hexes, at which that
// speed row becomes shaded. `null` means the row is shaded nowhere.
//
// Speeds above 10 are vehicle and aircraft rows; the ported 4D values there disagree with
// the book and must be re-transcribed before they are used. See the reference §7.
export const aimRestrictionSource=Object.freeze({book:'LEG10200',pdfPage:63,table:'4D',section:'3.1',revision:1,status:'visual-transcription'});
export const noMaximumAimFrom=Object.freeze([
  Object.freeze({speed:Object.freeze([0,1]),column:70}),
  Object.freeze({speed:Object.freeze([1,2]),column:100}),
  Object.freeze({speed:Object.freeze([2,3]),column:200}),
  Object.freeze({speed:Object.freeze([3,4]),column:300}),
  Object.freeze({speed:Object.freeze([4,10]),column:400}),
  Object.freeze({speed:Object.freeze([10,20]),column:1000}),
  Object.freeze({speed:Object.freeze([20,30]),column:1500}),
  Object.freeze({speed:Object.freeze([30,Infinity]),column:null})
]);
