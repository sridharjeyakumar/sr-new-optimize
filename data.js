section_data = {
    "AJJ-RU": {
        "section": ["AJJ-YD", "AJJ-AJJN", "MLPM -YD", "MLPM-AJJN", "AJJN-YD", "AJJN-TRT", "TRT-YD", "TRT-POI", "POI-YD", "POI-VKZ", "VKZ-NG", "NG-YD", "NG-EKM",
            "EKM-VGA", "VAG-YD", "VGA-PUT", "PUT-YD", "PUT-TDK", "TDK-YD", "TDK-PUDI", "PUDI-YD", "PUDI-RU", "RU-YD"]
    },


    "MAS-AJJ": {
        "section": ["MAS-YD", "MAS-BBQ", "MMCC-YD", "MMCC-BBQ", "BBQ-YD", "BBQ-VPY", "VPY-YD", "VPY-VLK", "VLK-YD", "VLK-ABU", "ABU-YD",
            "ABU-AVD", "AVD-YD", "AVD-PAB", "PAB-YD", "PAB-TI", "TI-YD", "TI-TRL", "TRL-YD", "TRL-KBT", "KBT-YD", "KBT-TO", "TO-YD", "TO-AJJ", "AJJ-YD"]
    },


    "MSB-VM": {
        "section": ["MSB-MS", "MS-YD", "MS-MKK", "MKK-YD", "MKK-MBM", "MBM-YD", "MBM-STM", "STM-YD", "STM-PV", "PV-YD", "PV-TBM", "TBM-YD", "TBM-PRGL",
            "PRGL-VDR", "VDR-YD", "VDR-UPM", "UPM-GI", "GI-YD", "POTI-CTM", "CTM-YD", "CTM-MMNK", "MMNK-SKL", "SKL-YD", "SKL-PWU", "PWU-CGL", "CGL-YD", "CGL-OV", "OV-YD", "OV-PTM", "PTM-KGZ", "KGZ-YD", "KGZ-MMK", "MMK-YD", "MMK-MLMR", "MLMR-YD", "MLMR-ACK", "ACK-TZD", "TZD-YD", "TZD-OLA", "OLA-YD", "OLA-TMV", "TMV-YD", "TMV-MTL", "MTL-YD", "MTL-PEI", "PEI-YD", "PEI-VVN", "VVN-YD", "VVN-MYP", "MYP-YD", "MYP-VM", "VM-YD"]
    },


    "AJJ-KPD": {
        "section": ["AJJ-YD", "AJJ-MLPM", "MLPM-YD", "MLPM-CTRE", "CTRE-YD", "CTRE-MDVE", "MDVE-YD", "MDVE-SHU", "SHU-YD", "SHU-TUG", "TUG-YD", "TUG-WJR",
            "WJR-YD", "WJR-MCN", "MCN-YD", "MCN-THL", "THL-YD", "THL-SVUR", "SVUR-YD", "SVUR-KPD", "KPD-YD"]
    },



    "MAS-GDR": {
        "section": ["MMC-YD", "MMC-BBQ", "BBQ-YD", "BBQ-KOK", "KOK-YD", "KOK-TNP", "TNP-YD", "TNP-TVT", "TVT-YD", "TVT-ENR", "ENR-YD", "ENR-AIP", "AIP-YD",
            "AIP-AIPP", "AIPP-YD", "AIPP-MJR", "MJR-YD", "MJR-PON", "PON-YD", "PON-KVP", "KVP-YD", "KVP-GPD", "GPD-YD", "GPD-ELR", "ELR-YD",
            "ELR-AKM", "AKM-YD", "AKM-TAD", "TAD-YD", "TAD-AKAT", "AKAT-SPE", "SPE-YD", "SPE-PEL", "PEL-YD", "PEL-DVR", "DVR-YD",
            "DVR-NYP", "NYP-YD", "NYP-PYA", "PYA-YD", "PYA-ODR", "ODR-YD", "ODR-GDR", "GDR-YD"]
    },



    "AJJ-CGL": {
        "section": ["CGL-RDY", "CGL-YD", "RDY-VB", "VB-PALR", "PALR-YD", "PALR-PYV", "PYV-WJ", "WJ-YD", "WJ-NTT", "NTT-CJ(O)", "CJ(O)-YD",
            "CJ(O)-CJ(E)", "CJ(E)-YD", "CJ(E)-TMLP", "TMLP-YD", "TMLP-TKO", "TKO-MLPM", "MLPM-YD", "MLPM-AJJ", "AJJ-YD"]
    },



    "KPD-JTJ": {
        "section": ["KPD-YD", "KPD-LTI", "LTI-YD", "LTI-KVN", "KVN-YD", "KVN-GYM", "GYM-YD", "GYM-VLT", "VLT-YD", "VLT-MPI", "MPI-YD", "MPI-PCKM", "PCKM-YD",
            "PCKM-AB", "AB-YD", "AB-VGM", "VGM-YD", "VGM-VN", "VN-YD", "VN-KDY", "KDY-YD", "KDY-JTJ", "JTJ-YD"]
    },
}

line_data = {
    "AJJ-RU": { "UP": 0, "DN": 1 },
    "MAS-AJJ": { "Up slow": 0, "Down slow": 1, "Up fast": 0, "Down fast": 1 },
    "MSB-VM": { "UP line": 0, "Up sub urban": 0, "Down Sub urban": 1, "Down line": 1, "B line": 2, "A line": 2 },
    "AJJ-KPD": { "UP line": 0, "Down line": 1 },
    "MAS-GDR": { "UP slow": 0, "UP fast": 0, "UP line": 0, "Down Slow": 1, "Down Fast": 1, "Down line": 1 },
    "AJJ-CGL": { "UP line": 0, "Down line": 1 },
    "KPD-JTJ": { "UP line": 0, "Down line": 1 },
}

road_line_data = {

    "MAS-GDR": {
        "KOK-TNP": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "TVT-ENR": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "MMC-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1
        },
        "BBQ-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1
        },
        "KOK-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1
        },
        "TNP-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "TVT-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "ENR-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "AIP-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "AIPP-YD": {
            "UP slow": 0,
            "UP fast": 0,
            "Down Slow": 1,
            "Down Fast": 1,
        },
        "MJR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "PON-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "KVP-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "GPD-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "ELR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "AKM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "TAD-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "SPE-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "PEL-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "DVR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "NYP-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "PYA-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "ODR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "GDR-YD": {
            "UP line": 0,
            "Down line": 1
        }
    },

    "AJJ-RU": {
        "AJJ-YD": {
            "UP": 0,
            "DN": 1
        },
        "MLPM-YD": {
            "UP": 0,
            "DN": 1
        },
        "AJJN-YD": {
            "UP": 0,
            "DN": 1
        },
        "TRT-YD": {
            "UP": 0,
            "DN": 1
        },
        "POI-YD": {
            "UP": 0,
            "DN": 1
        },
        "NG-YD": {
            "UP": 0,
            "DN": 1
        },
        "VAG-YD": {
            "UP": 0,
            "DN": 1
        },
        "PUT-YD": {
            "UP": 0,
            "DN": 1
        },
        "TDK-YD": {
            "UP": 0,
            "DN": 1
        },
        "PUDI-YD": {
            "UP": 0,
            "DN": 1
        },
        "RU-YD": {
            "UP": 0,
            "DN": 1
        }
    },
    "MAS-AJJ": {
        "MAS-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "BBQ-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "MMCC-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "VPY-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "VLK-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "ABU-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "AVD-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "PAB-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "TI-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "TRL-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "KBT-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "TO-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        },
        "AJJ-YD": {
            "Up slow": 0,
            "Down slow": 1,
            "Up fast": 0,
            "Down fast": 1
        }
    },
    "MSB-VM": {
        "MS-YD": {
            "Up sub urban": 0,
            "Down Sub urban": 1,
            "B line": 2,
            "A line": 2
        },
        "MKK-YD": {
            "Up sub urban": 0,
            "Down Sub urban": 1,
            "B line": 2,
            "A line": 2
        },
        "MBM-YD": {
            "Up sub urban": 0,
            "Down Sub urban": 1,
            "B line": 2,
            "A line": 2
        },
        "STM-YD": {
            "Up sub urban": 0,
            "Down Sub urban": 1,
            "B line": 2,
            "A line": 2
        },
        "PV-YD": {
            "Up sub urban": 0,
            "Down Sub urban": 1,
            "B line": 2,
            "A line": 2
        },
        "TBM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "VDR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "GI-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "CTM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "SKL-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "CGL-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "OV-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "KGZ-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MMK-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MLMR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "TZD-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "OLA-YD": {
            "UP line": 0,
            "Down line": 1,
        },
        "TMV-YD": {
            "UP line": 0,
            "Down line": 1,
        },
        "MTL-YD": {
            "UP line": 0,
            "Down line": 1,
        },
        "PEI-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "VVN-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MYP-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "VM-YD": {
            "UP line": 0,
            "Down line": 1
        }
    },
    "KPD-JTJ": {
        "KPD-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "LTI-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "KVN-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "GYM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "VLT-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MPI-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "PCKM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "AB-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "VGM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "VN-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "KDY-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "JTJ-YD": {
            "UP line": 0,
            "Down line": 1
        }
    },
    "AJJ-CGL": {
        "CGL-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "PALR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "WJ-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "CJ(O)-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "CJ(E)-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "TMLP-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MLPM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "AJJ-YD": {
            "UP line": 0,
            "Down line": 1
        }
    },
    "AJJ-KPD": {
        "AJJ-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MLPM-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "CTRE-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MDVE-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "SHU-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "TUG-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "WJR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "MCN-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "THL-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "SVUR-YD": {
            "UP line": 0,
            "Down line": 1
        },
        "KPD-YD": {
            "UP line": 0,
            "Down line": 1
        }
    }
}

module.exports = { section_data, line_data, road_line_data };
