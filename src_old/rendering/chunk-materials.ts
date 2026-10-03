import * as THREE from 'three';

import type { TextureAtlas } from './texture-atlas';

/**
 * GLSL snippets injected into three MeshBasicMaterial
 *  vertex: runs after `vec3 transformed = position;`
 *      chunk-local; use `worldPos` for world coords; `uTime` is seconds
 *  fragment: runs before final color; may modify `diffuseColor`
 */
export interface ShaderHook {vertex?: string; fragment?: string }

const LIGHT = 'diffuseColor.rgb *= uLight;';    // time-of-day lighting

/** one hook per render layer (opaque, cutout, translucent), defaults: day/night light, moving water */
export const DEFAULT_HOOKS: (ShaderHook | undefined)[] = [
    { fragment: LIGHT },
    { fragment: LIGHT },
    {
        vertex: 'transformed.y += step(0.5, fract(transformed.y)) * 0.05 * sin(uTime * 1.6 + worldPos.x * 0.9 + worldPos.z * 0.7);',
        fragment: LIGHT,
    },
];

export class ChunkMaterials {
    readonly list: THREE.MeshBasicMaterial[];
    private time = { value: 0 };
    private light = { value: new THREE.Vector3(1, 1, 1) };

    constructor(atlas: TextureAtlas, hooks = DEFAULT_HOOKS) {
        const base = { vertexColors: true, map: atlas.texture };
        const params: THREE.MeshBasicMaterialParameters[] = [
            base,
            { ...base, alphaTest: 0.5, side: THREE.DoubleSide },                // leaves + cross plants
            { ...base, transparent: true, opacity: 0.75, depthWrite: false},    // water
        ];
        
        const decl = '#include <common>\nuniform float uTime;\nuniform vec3 uLight;';
        this.list = params.map((p, layer) => {
            const hook = hooks[layer];
            const m = new THREE.MeshBasicMaterial(p);
            m.customProgramCacheKey = () => `chunk-${layer}-${hook?.vertex ?? ''}-${hook?.fragment ?? ''}`;
            m.onBeforeCompile = (s) => {
                s.uniforms.uTime = this.time;
                s.uniforms.uLight = this.light;

                s.vertexShader = s.vertexShader
                .replace('#include <common>', decl)
                .replace('#include <begin_vertex>', `#include <begin_vertex>\nvec3 worldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\n${hook?.vertex ?? ''}`);
                s.fragmentShader = s.fragmentShader
                .replace('#include <common>', decl)
                .replace('#include <opaque_fragment>', `${hook?.fragment ?? ''}\n#include <opaque_fragment>`);
            };
            return m;
        });
        atlas.onRebuild = () => {
            for (const m of this.list) {
                m.map = atlas.texture; m.needsUpdate = true;
            }
        };
    }

    update(seconds: number) {
        this.time.value = seconds;
    }

    setLight(c: THREE.Color) {
        this.light.value.set(c.r, c.g, c.b);
    }
}
