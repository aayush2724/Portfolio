# 3D Models Directory

## Required: Guitar Model

Place your `guitar.glb` file here for the 3D scene to work.

### Free Guitar Model Sources

#### 1. Poly Pizza (Recommended - CC0)
**URL:** https://poly.pizza
- Search: "guitar" or "electric guitar"
- Filter: CC0 license (no attribution needed)
- Download as .glb format
- Usually 100-300KB, very performant

#### 2. Sketchfab
**URL:** https://sketchfab.com/search?type=models&q=guitar
- Filter: Downloadable + Free
- Check license carefully (some require attribution)
- Look for models under 500KB and <100K triangles
- Download → select .glb format

#### 3. Quaternius (Asset Packs)
**URL:** http://quaternius.com/packs.html
- Look for "Ultimate Modular Instruments" pack
- All CC0, clean stylized aesthetic
- Pre-optimized for web

### Quick Recommendations

**Electric Guitar:**
- More "developer/maker" vibe
- Usually more angular/geometric (renders well)
- Matches the tech aesthetic

**Acoustic Guitar:**
- More personal/artistic feel
- Ties to "Stairway to Heaven" reference
- Warmer aesthetic

**Stylized vs Realistic:**
- Stylized/low-poly = better performance, cleaner look
- Realistic = impressive but heavier file size

### File Requirements

- **Format:** .glb (GLTF binary)
- **Size:** Under 500KB recommended (100-300KB ideal)
- **Triangles:** Under 100K for best performance
- **Textures:** Embedded in .glb file

### After Downloading

1. Rename your file to `guitar.glb`
2. Place it in this directory (`/public/models/guitar.glb`)
3. Refresh your dev server
4. The guitar should appear in your hero background

### Troubleshooting

**Guitar not showing:**
- Check browser console for errors
- Verify file is named exactly `guitar.glb`
- Confirm file path is `/public/models/guitar.glb`

**Guitar facing wrong direction:**
- Edit `src/three/ScrollScene.jsx`
- Find the `<group ref={group} dispose={null}>` line
- Add rotation: `<group ref={group} rotation={[0, Math.PI / 2, 0]} dispose={null}>`
- Adjust angles until it faces correctly

**Guitar too big/small:**
- Change `scale` prop in ScrollScene: `<Guitar scale={2.0} />`
- Default is 1.6, try values between 1.0 and 3.0

**Guitar position off:**
- Guitar will follow mouse and scroll automatically
- To adjust base position, modify the Float wrapper position

### Current Status

- ✅ `/public/models/` directory created
- ⏳ Waiting for `guitar.glb` file
- ✅ ScrollScene.jsx configured and ready
