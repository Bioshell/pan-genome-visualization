import {render_chart_table} from "./interact";
//import {create_dropdown} from "./meta-color-legend";
import * as datapath from "./data_path";
import speciesTree from "./speciesTree";
import  {chartExample2} from "./datatable-meta";
import {changeLayout, updateTips} from "../phyloTree/src/updateTree";
import {buttons, treeProp, attachButtons} from "./tree-init";

// /** strain_tree processing */
//render_tree(0, "mytree1", coreTree_path, clusterID=null, null);

var mySpeciesTree;
const handleSpeciesTree = function(newTree){
    newTree.namesToTips = {};
    for (var ti =0; ti<newTree.tips.length; ti++){
        var tip = newTree.tips[ti];
        tip.name = tip.n.name;
        tip.genes = [];
        newTree.namesToTips[tip.name] = tip;
    }
    mySpeciesTree = newTree;
    attachButtons(mySpeciesTree, {layout:"TreeViewSelect",
                                  zoomInY:"Height_plus_Toggle",
                                  zoomOutY:"Height_minus_Toggle",
                                  scale:"ScalesToggle",
                                  tipLabels:"InnerNodeToggle",
                                  zoomReset:"tree_zoom_reset"});
    console.log("render_viewer:",mySpeciesTree);
}
var myGeneTree;
const handleGeneTree = function(newTree){
    myGeneTree = newTree;
    console.log("render_viewer:",myGeneTree);
}


const connectTrees = function(){
    if (mySpeciesTree&&myGeneTree){
        console.log("connecting trees");
        myGeneTree.paralogs = {}
        for (var ti =0; ti<myGeneTree.tips.length; ti++){
            var tip = myGeneTree.tips[ti];
            tip.name = tip.n.name;
            tip.accession = tip.n.accession;
            tip.strainTip = mySpeciesTree.svg.selectAll("#"+mySpeciesTree.namesToTips[tip.accession].tipAttributes.id);
            if (myGeneTree.paralogs[tip.accession]){
                myGeneTree.paralogs[tip.accession].push(tip);
            }else{
                myGeneTree.paralogs[tip.accession] = [tip];
            }
        }
        console.log("connectTrees", myGeneTree);
        for (var ti =0; ti<mySpeciesTree.tips.length; ti++){
            var species = mySpeciesTree.tips[ti];
            species.genes = [];
            for (var gi=0; gi<myGeneTree.paralogs[species.name].length; gi++){
                species.genes.push(myGeneTree.svg.selectAll("#"+myGeneTree.paralogs[species.name][gi].tipAttributes.id));
            }
            if (myGeneTree.paralogs[species.name]){
                species.genePresent = true;
                species.tipAttributes.fill = treeProp.genePresentFill;
                species.tipAttributes.r = treeProp.genePresentR;
            }else{
                species.genePresent = false;
                species.tipAttributes.fill = treeProp.geneAbsentFill;
                species.tipAttributes.r = treeProp.geneAbsentR;
            }
        }
        updateTips(mySpeciesTree,['r'],['fill'],200);
    }else{
        console.log("trees not available yet, retry", mySpeciesTree, myGeneTree);
        setTimeout(connectTrees, 1000);
    }
}


speciesTree("speciesTree", datapath.coreTree_path, handleSpeciesTree);


// /** tree rotate listener */
// rotate_monitor('tree_rotate','mytree2');

/** create metadata dropdown list */
//create_dropdown("#dropdown_list",'mytree1','mytree2','coreTree_legend',null);

/** render interactive charts and gene-cluster datatable */
//console.log("render_viewer:",datapath);
render_chart_table.initData(datapath.path_datatable1,'dc_data_table', 'GC_tablecol_select',
    'dc_data_count','dc_straincount_chart','dc_geneLength_chart','dc_coreAcc_piechart',
    'changeCoreThreshold','coreThreshold',
    'speciesTreeDiv','geneTreeDiv', null, handleGeneTree);

connectTrees();

/** render meta-data datatable */
var meta_table_id='dc_data_table_meta';
chartExample2.dataTable2Fun(meta_table_id);
